from django.urls import path

from arbitrage.consumers import ArbitrageConsumer

websocket_urlpatterns = [
    path("ws/arbitrage/", ArbitrageConsumer.as_asgi()),
]
