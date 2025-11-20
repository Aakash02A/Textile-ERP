from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ModelMetaViewSet

router = DefaultRouter()
router.register(r'models', ModelMetaViewSet, basename='modelmeta')

urlpatterns = [
    path('', include(router.urls)),
]