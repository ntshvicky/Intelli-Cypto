import json
import uuid
from decimal import Decimal, InvalidOperation

from asgiref.sync import async_to_sync
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import AccessToken, SystemLog, Trade, UserProfile
from .services.arbitrage_engine import ArbitrageEngine
from .services.crypto_ai import live_predictions


PROFILE_FIELDS = {
    "fullName": "full_name",
    "expertise": "expertise",
    "country": "country",
    "baseCurrency": "base_currency",
    "riskProfile": "risk_profile",
    "maxTradeSize": "max_trade_size",
    "exchanges": "exchanges",
    "marketDataMode": "market_data_mode",
    "refreshInterval": "refresh_interval",
    "makerFee": "maker_fee",
    "takerFee": "taker_fee",
    "slippageBuffer": "slippage_buffer",
    "minNetSpread": "min_net_spread",
    "paperTrading": "paper_trading",
    "autoExecute": "auto_execute",
    "smartAlerts": "smart_alerts",
    "anomalyDetection": "anomaly_detection",
    "whaleWatch": "whale_watch",
    "newsSentiment": "news_sentiment",
    "executionPreset": "execution_preset",
    "twoFactor": "two_factor",
}


def json_body(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


def error(message, status=400):
    return JsonResponse({"error": message}, status=status)


def authenticated_user(request):
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None, None
    raw_token = header.removeprefix("Bearer ").strip()
    token = AccessToken.objects.select_related("user").filter(
        key_hash=AccessToken.hash_token(raw_token)
    ).first()
    return (token.user, token) if token else (None, None)


def serialize_user(user):
    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={"exchanges": ["Binance", "Kraken", "Coinbase"]},
    )
    data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "isDemo": False,
    }
    for client_name, model_name in PROFILE_FIELDS.items():
        value = getattr(profile, model_name)
        if isinstance(value, Decimal):
            value = str(value)
        data[client_name] = value
    return data


def apply_profile(profile, data):
    for client_name, model_name in PROFILE_FIELDS.items():
        if client_name in data:
            setattr(profile, model_name, data[client_name])
    profile.save()


@require_http_methods(["GET"])
def health(request):
    return JsonResponse({"status": "ok", "database": "mysql", "marketData": "ccxt"})


@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    data = json_body(request)
    if data is None:
        return error("Invalid JSON body.")
    required = ("username", "email", "password")
    if any(not str(data.get(field, "")).strip() for field in required):
        return error("Username, email, and password are required.")
    if len(data["password"]) < 8:
        return error("Password must contain at least 8 characters.")

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=data["username"].strip(),
                email=data["email"].strip().lower(),
                password=data["password"],
            )
            profile = UserProfile.objects.create(user=user)
            apply_profile(profile, data)
            token = AccessToken.issue(user)
    except IntegrityError:
        return error("That username is already registered.", 409)

    return JsonResponse({"token": token, "user": serialize_user(user)}, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    data = json_body(request)
    if data is None:
        return error("Invalid JSON body.")
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    matched = User.objects.filter(email__iexact=email).first()
    user = authenticate(username=matched.username, password=password) if matched else None
    if user is None:
        return error("Invalid email or password.", 401)
    token = AccessToken.issue(user)
    return JsonResponse({"token": token, "user": serialize_user(user)})


@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def me(request):
    user, _ = authenticated_user(request)
    if user is None:
        return error("Authentication required.", 401)
    if request.method == "PATCH":
        data = json_body(request)
        if data is None:
            return error("Invalid JSON body.")
        if "email" in data:
            user.email = str(data["email"]).strip().lower()
        if "username" in data:
            user.username = str(data["username"]).strip()
        try:
            with transaction.atomic():
                user.save()
                apply_profile(user.profile, data)
        except IntegrityError:
            return error("That username is already registered.", 409)
    return JsonResponse({"user": serialize_user(user)})


@csrf_exempt
@require_http_methods(["POST"])
def logout(request):
    user, token = authenticated_user(request)
    if user is None:
        return error("Authentication required.", 401)
    token.delete()
    return JsonResponse({"status": "ok"})


def serialize_trade(item):
    pnl = float(item.pnl)
    return {
        "id": item.execution_id,
        "time": item.created_at.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
        "pair": item.pair,
        "side": item.side,
        "exchange": item.exchange,
        "amount": str(item.amount),
        "price": str(item.price),
        "action": item.action,
        "pnl": f"{'+' if pnl >= 0 else '-'}${abs(pnl):.2f}",
        "result": item.result,
        "dataMode": item.data_mode,
    }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def trades(request):
    user, _ = authenticated_user(request)
    if user is None:
        return error("Authentication required.", 401)
    if request.method == "GET":
        return JsonResponse({"trades": [serialize_trade(item) for item in user.trades.all()[:100]]})

    data = json_body(request)
    if data is None:
        return error("Invalid JSON body.")
    try:
        amount = Decimal(str(data.get("amount", 0)))
        price = Decimal(str(data.get("price", 0)))
    except InvalidOperation:
        return error("Amount and price must be valid numbers.")
    if amount <= 0 or price < 0:
        return error("Amount must be positive and price cannot be negative.")

    result = str(data.get("result", "Filled"))
    pnl = amount * price * Decimal("0.0018") if result == "Filled" else Decimal("0")
    execution_id = f"PAPER-{uuid.uuid4().hex[:10].upper()}"
    item = Trade.objects.create(
        user=user,
        execution_id=execution_id,
        pair=str(data.get("pair", ""))[:24],
        side=str(data.get("side", ""))[:12],
        exchange=str(data.get("exchange", ""))[:120],
        amount=amount,
        price=price,
        pnl=pnl,
        result=result[:24],
        action=str(data.get("action") or f"{data.get('side')} {amount} on {data.get('exchange')}")[:255],
        data_mode=str(data.get("dataMode", "Live"))[:12],
    )
    SystemLog.objects.create(
        user=user,
        source=str(data.get("logSource", "ExecutionDesk"))[:80],
        message=str(data.get("logMessage") or f"Paper trade {execution_id} recorded in MySQL."),
    )
    return JsonResponse({"trade": serialize_trade(item)}, status=201)


def serialize_log(item):
    return {
        "id": item.id,
        "level": item.level,
        "time": item.created_at.astimezone().strftime("%Y-%m-%d %H:%M:%S"),
        "source": item.source,
        "message": item.message,
    }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def logs(request):
    user, _ = authenticated_user(request)
    if user is None:
        return error("Authentication required.", 401)
    if request.method == "GET":
        return JsonResponse({"logs": [serialize_log(item) for item in user.system_logs.all()[:150]]})
    data = json_body(request)
    if data is None:
        return error("Invalid JSON body.")
    item = SystemLog.objects.create(
        user=user,
        level=str(data.get("level", "INFO"))[:12],
        source=str(data.get("source", "Application"))[:80],
        message=str(data.get("message", "")),
    )
    return JsonResponse({"log": serialize_log(item)}, status=201)


@require_http_methods(["GET"])
def market_snapshot(request):
    requested = [item.strip().lower() for item in request.GET.get("exchanges", "").split(",") if item.strip()]
    supported = {"binance", "kraken", "coinbase", "okx", "bybit", "kucoin"}
    exchange_ids = tuple(item for item in requested if item in supported) or None
    snapshot = async_to_sync(ArbitrageEngine(exchange_ids).snapshot)()
    return JsonResponse(snapshot)


@require_http_methods(["GET"])
def ai_predictions(request):
    requested = request.GET.get("exchange", "kraken").strip().lower()
    exchange_id = requested if requested in {"binance", "kraken", "coinbase", "okx", "bybit", "kucoin"} else "kraken"
    predictions = async_to_sync(live_predictions)(exchange_id)
    return JsonResponse({"source": exchange_id, "predictions": predictions})
