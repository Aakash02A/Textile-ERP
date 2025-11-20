from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalesOrderViewSet, CustomerFeedbackViewSet

router = DefaultRouter()
router.register(r'orders', SalesOrderViewSet, basename='salesorder')
router.register(r'feedback', CustomerFeedbackViewSet, basename='customerfeedback')

urlpatterns = [
    path('', include(router.urls)),
]