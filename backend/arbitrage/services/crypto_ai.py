from dataclasses import dataclass
from statistics import fmean, pstdev

import asyncio

import ccxt.async_support as ccxt


@dataclass(frozen=True)
class Prediction:
    action: str
    confidence: int
    target_price: float


class CryptoAI:
    def analyze(self, prices: list[float]) -> dict:
        if len(prices) < 100:
            raise ValueError("CryptoAI requires at least 100 price points.")

        recent = [float(price) for price in prices[-100:]]
        current_price = recent[-1]
        mean_price = fmean(recent)
        std_price = pstdev(recent)
        rsi = self._rsi(recent)

        lower_band = mean_price - std_price
        upper_band = mean_price + std_price

        if current_price < lower_band and rsi < 35:
            confidence = min(100, int((35 - rsi) * 2 + ((lower_band - current_price) / current_price) * 1000))
            prediction = Prediction("BUY", confidence, mean_price)
        elif current_price > upper_band and rsi > 65:
            confidence = min(100, int((rsi - 65) * 2 + ((current_price - upper_band) / current_price) * 1000))
            prediction = Prediction("SELL", confidence, mean_price)
        else:
            distance_to_mean = abs(current_price - mean_price) / current_price
            confidence = max(35, 70 - int(distance_to_mean * 1000))
            prediction = Prediction("HOLD", min(100, confidence), current_price)

        return {
            "action": prediction.action,
            "confidence": prediction.confidence,
            "target_price": round(prediction.target_price, 8),
            "rsi": round(rsi, 2),
        }

    def _rsi(self, prices: list[float], period: int = 14) -> float:
        deltas = [current - previous for previous, current in zip(prices, prices[1:])]
        gains = [delta if delta > 0 else 0.0 for delta in deltas]
        losses = [-delta if delta < 0 else 0.0 for delta in deltas]

        avg_gain = fmean(gains[-period:])
        avg_loss = fmean(losses[-period:])
        if avg_loss == 0:
            return 100.0

        rs = avg_gain / avg_loss
        return float(100 - (100 / (1 + rs)))


async def live_predictions(exchange_id: str = "kraken") -> list[dict]:
    exchange_class = getattr(ccxt, exchange_id)
    exchange = exchange_class({"enableRateLimit": True})
    symbols = ("BTC/USDT", "ETH/USDT", "SOL/USDT")

    async def analyze_symbol(symbol: str):
        try:
            candles = await exchange.fetch_ohlcv(symbol, timeframe="5m", limit=100)
            prices = [float(candle[4]) for candle in candles]
            if len(prices) < 100:
                return None
            result = CryptoAI().analyze(prices)
            return {
                "symbol": symbol,
                **result,
                "horizon": "5m · 100 candles",
                "last_price": prices[-1],
                "source": exchange_id,
            }
        except Exception:
            return None

    try:
        results = await asyncio.gather(*(analyze_symbol(symbol) for symbol in symbols))
        return [result for result in results if result is not None]
    finally:
        await exchange.close()
