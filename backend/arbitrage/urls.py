from django.urls import path

from . import api

urlpatterns = [
    path("health/", api.health),
    path("auth/register/", api.register),
    path("auth/login/", api.login),
    path("auth/me/", api.me),
    path("auth/logout/", api.logout),
    path("trades/", api.trades),
    path("logs/", api.logs),
    path("market/snapshot/", api.market_snapshot),
    path("ai/predictions/", api.ai_predictions),
]
