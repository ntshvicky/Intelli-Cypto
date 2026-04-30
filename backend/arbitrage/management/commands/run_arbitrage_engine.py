import asyncio

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.management.base import BaseCommand

from arbitrage.services.arbitrage_engine import ArbitrageEngine


class Command(BaseCommand):
    help = "Streams cross-exchange arbitrage snapshots to the arbitrage WebSocket group every second."

    def add_arguments(self, parser) -> None:
        parser.add_argument("--interval", type=float, default=1.0)
        parser.add_argument(
            "--exchanges",
            type=str,
            default="binance,kraken,coinbase,okx,bybit,kucoin",
            help="Comma-separated CCXT exchange ids.",
        )

    def handle(self, *args, **options) -> None:
        exchange_ids = tuple(item.strip() for item in options["exchanges"].split(",") if item.strip())
        async_to_sync(self._run)(options["interval"], exchange_ids)

    async def _run(self, interval: float, exchange_ids: tuple[str, ...]) -> None:
        engine = ArbitrageEngine(exchange_ids=exchange_ids)
        channel_layer = get_channel_layer()

        if channel_layer is None:
            raise RuntimeError("Django Channels is not configured.")

        self.stdout.write(self.style.SUCCESS("Arbitrage engine started. Press Ctrl+C to stop."))
        while True:
            payload = await engine.snapshot()
            await channel_layer.group_send(
                "arbitrage_stream",
                {
                    "type": "arbitrage.update",
                    "payload": payload,
                },
            )
            self.stdout.write(f"Published {len(payload['opportunities'])} opportunities")
            await asyncio.sleep(interval)
