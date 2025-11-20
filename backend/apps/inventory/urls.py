from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RawMaterialViewSet, StockLotViewSet

router = DefaultRouter()
router.register(r'rawmaterials', RawMaterialViewSet, basename='rawmaterial')
router.register(r'stocklots', StockLotViewSet, basename='stocklot')

urlpatterns = [
    path('', include(router.urls)),
]