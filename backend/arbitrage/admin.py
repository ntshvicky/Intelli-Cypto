from django.contrib import admin

from .models import AccessToken, SystemLog, Trade, UserProfile

admin.site.register(UserProfile)
admin.site.register(AccessToken)
admin.site.register(Trade)
admin.site.register(SystemLog)
