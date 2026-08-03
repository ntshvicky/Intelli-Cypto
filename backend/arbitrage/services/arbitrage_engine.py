import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import ccxt.async_support as ccxt


@dataclass(frozen=True)
class ExchangeTicker:
    exchange: str
    symbol: str
    bid: float | None
    ask: float | None
    last: float | None
    quote_volume: float | None
    percentage: float | None
    timestamp: str


class ArbitrageEngine:
    symbols = ("BTC/USDT", "ETH/USDT")

    def __init__(self, exchange_ids: tuple[str, ...] | None = None) -> None:
        self.exchange_ids = exchange_ids or ("binance", "kraken", "coinbase", "okx", "bybit", "kucoin")

    async def snapshot(self) -> dict[str, Any]:
        tickers = await self._fetch_all_tickers()
        opportunities = self._find_opportunities(tickers)
        return {
            "type": "arbitrage.snapshot",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "tickers": [ticker.__dict__ for ticker in tickers],
            "opportunities": opportunities,
        }

    async def _fetch_all_tickers(self) -> list[ExchangeTicker]:
        tasks = [
            self._fetch_exchange_symbol(exchange_id, symbol)
            for exchange_id in self.exchange_ids
            for symbol in self.symbols
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return [result for result in results if isinstance(result, ExchangeTicker)]

    async def _fetch_exchange_symbol(self, exchange_id: str, symbol: str) -> ExchangeTicker | None:
        exchange_class = getattr(ccxt, exchange_id)
        exchange = exchange_class({"enableRateLimit": True})
        try:
            ticker = await exchange.fetch_ticker(symbol)
            return ExchangeTicker(
                exchange=exchange_id,
                symbol=symbol,
                bid=self._float_or_none(ticker.get("bid")),
                ask=self._float_or_none(ticker.get("ask")),
                last=self._float_or_none(ticker.get("last")),
                quote_volume=self._float_or_none(ticker.get("quoteVolume")),
                percentage=self._float_or_none(ticker.get("percentage")),
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        except Exception:
            return None
        finally:
            await exchange.close()

    def _find_opportunities(self, tickers: list[ExchangeTicker]) -> list[dict[str, Any]]:
        opportunities: list[dict[str, Any]] = []
        by_symbol: dict[str, list[ExchangeTicker]] = {}

        for ticker in tickers:
            by_symbol.setdefault(ticker.symbol, []).append(ticker)

        for symbol, symbol_tickers in by_symbol.items():
            for buy_side in symbol_tickers:
                if buy_side.ask is None:
                    continue
                for sell_side in symbol_tickers:
                    if buy_side.exchange == sell_side.exchange or sell_side.bid is None:
                        continue
                    if buy_side.ask < sell_side.bid:
                        spread = sell_side.bid - buy_side.ask
                        spread_pct = (spread / buy_side.ask) * 100
                        opportunities.append(
                            {
                                "symbol": symbol,
                                "buy_exchange": buy_side.exchange,
                                "sell_exchange": sell_side.exchange,
                                "buy_ask": buy_side.ask,
                                "sell_bid": sell_side.bid,
                                "spread": round(spread, 8),
                                "spread_pct": round(spread_pct, 4),
                                "signal": f"BUY at {buy_side.exchange}, SELL at {sell_side.exchange}",
                            }
                        )

        return sorted(opportunities, key=lambda item: item["spread_pct"], reverse=True)

    @staticmethod
    def _float_or_none(value: Any) -> float | None:
        try:
            return float(value) if value is not None else None
        except (TypeError, ValueError):
            return None
