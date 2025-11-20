from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Supplier, PurchaseOrder, PurchaseItem
from .serializers import SupplierSerializer, PurchaseOrderSerializer, PurchaseOrderCreateSerializer, PurchaseOrderUpdateSerializer


class SupplierViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Suppliers.
    """
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Purchase Orders.
    """
    queryset = PurchaseOrder.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PurchaseOrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PurchaseOrderUpdateSerializer
        return PurchaseOrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['put'])
    def update_status(self, request, pk=None):
        """
        Update the status of a purchase order.
        """
        purchase_order = self.get_object()
        serializer = PurchaseOrderUpdateSerializer(purchase_order, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)