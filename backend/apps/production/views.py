from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import BillOfMaterials, WorkOrder, WorkOrderProgress
from .serializers import BillOfMaterialsSerializer, WorkOrderSerializer, WorkOrderProgressSerializer, WorkOrderProgressUpdateSerializer


class BillOfMaterialsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Bill of Materials.
    """
    queryset = BillOfMaterials.objects.all()
    serializer_class = BillOfMaterialsSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        product_code = self.request.query_params.get('product_code', None)
        if product_code:
            queryset = queryset.filter(product_code=product_code)
        return queryset


class WorkOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Work Orders.
    """
    queryset = WorkOrder.objects.all()
    serializer_class = WorkOrderSerializer
    
    @action(detail=True, methods=['post'])
    def progress(self, request, pk=None):
        """
        Update work order progress.
        """
        work_order = self.get_object()
        serializer = WorkOrderProgressUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            progress = WorkOrderProgress.objects.create(
                work_order=work_order,
                phase=serializer.validated_data['phase'],
                completed_qty=serializer.validated_data['completed_qty'],
                notes=serializer.validated_data.get('notes', '')
            )
            
            response_serializer = WorkOrderProgressSerializer(progress)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def progress_history(self, request, pk=None):
        """
        Get progress history for a work order.
        """
        work_order = self.get_object()
        progress_updates = WorkOrderProgress.objects.filter(work_order=work_order)
        serializer = WorkOrderProgressSerializer(progress_updates, many=True)
        return Response(serializer.data)