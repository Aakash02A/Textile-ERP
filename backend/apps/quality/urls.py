from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DefectLogViewSet

router = DefaultRouter()
router.register(r'defects', DefectLogViewSet, basename='defectlog')

urlpatterns = [
    path('', include(router.urls)),
]