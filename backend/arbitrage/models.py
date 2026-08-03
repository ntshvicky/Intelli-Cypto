import hashlib
import secrets

from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=160, blank=True)
    expertise = models.CharField(max_length=32, default="Beginner")
    country = models.CharField(max_length=80, default="India")
    base_currency = models.CharField(max_length=12, default="USD")
    risk_profile = models.CharField(max_length=32, default="Balanced")
    max_trade_size = models.DecimalField(max_digits=20, decimal_places=8, default=1000)
    exchanges = models.JSONField(default=list)
    market_data_mode = models.CharField(max_length=12, default="Live")
    refresh_interval = models.PositiveSmallIntegerField(default=5)
    maker_fee = models.DecimalField(max_digits=8, decimal_places=4, default=0.08)
    taker_fee = models.DecimalField(max_digits=8, decimal_places=4, default=0.10)
    slippage_buffer = models.DecimalField(max_digits=8, decimal_places=4, default=0.12)
    min_net_spread = models.DecimalField(max_digits=8, decimal_places=4, default=0.18)
    paper_trading = models.BooleanField(default=True)
    auto_execute = models.BooleanField(default=False)
    smart_alerts = models.BooleanField(default=True)
    anomaly_detection = models.BooleanField(default=True)
    whale_watch = models.BooleanField(default=True)
    news_sentiment = models.BooleanField(default=True)
    execution_preset = models.CharField(max_length=32, default="Balanced")
    two_factor = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)


class AccessToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="access_tokens")
    key_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def issue(cls, user):
        raw_token = secrets.token_urlsafe(40)
        cls.objects.create(user=user, key_hash=cls.hash_token(raw_token))
        return raw_token

    @staticmethod
    def hash_token(raw_token):
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


class Trade(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trades")
    execution_id = models.CharField(max_length=40, unique=True)
    pair = models.CharField(max_length=24)
    side = models.CharField(max_length=12)
    exchange = models.CharField(max_length=120)
    amount = models.DecimalField(max_digits=28, decimal_places=10)
    price = models.DecimalField(max_digits=28, decimal_places=10)
    pnl = models.DecimalField(max_digits=24, decimal_places=8, default=0)
    result = models.CharField(max_length=24, default="Filled")
    action = models.CharField(max_length=255)
    data_mode = models.CharField(max_length=12, default="Live")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)


class SystemLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="system_logs")
    level = models.CharField(max_length=12, default="INFO")
    source = models.CharField(max_length=80)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
