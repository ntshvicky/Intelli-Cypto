import json

from channels.generic.websocket import AsyncWebsocketConsumer


class ArbitrageConsumer(AsyncWebsocketConsumer):
    group_name = "arbitrage_stream"

    async def connect(self) -> None:
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code: int) -> None:
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def arbitrage_update(self, event: dict) -> None:
        await self.send(text_data=json.dumps(event["payload"]))
