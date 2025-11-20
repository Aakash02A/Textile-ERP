from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillOfMaterialsViewSet, WorkOrderViewSet

router = DefaultRouter()
router.register(r'boms', BillOfMaterialsViewSet, basename='bom')
router.register(r'workorders', WorkOrderViewSet, basename='workorder')

urlpatterns = [
    path('', include(router.urls)),
]