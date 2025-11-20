from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/procurement/', include('apps.procurement.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/production/', include('apps.production.urls')),
    path('api/v1/quality/', include('apps.quality.urls')),
    path('api/v1/sales/', include('apps.sales.urls')),
    path('api/v1/ml/', include('apps.ml_service.urls')),
]