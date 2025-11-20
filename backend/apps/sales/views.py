from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SalesOrder, SalesOrderItem, CustomerFeedback
from .serializers import SalesOrderSerializer, SalesOrderCreateSerializer, CustomerFeedbackSerializer


class SalesOrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Sales Orders.
    """
    queryset = SalesOrder.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SalesOrderCreateSerializer
        return SalesOrderSerializer
    
    @action(detail=True, methods=['post'])
    def add_feedback(self, request, pk=None):
        """
        Add customer feedback to a sales order.
        """
        sales_order = self.get_object()
        serializer = CustomerFeedbackSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(sales_order=sales_order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def feedback(self, request, pk=None):
        """
        Get feedback for a sales order.
        """
        sales_order = self.get_object()
        try:
            feedback = CustomerFeedback.objects.get(sales_order=sales_order)
            serializer = CustomerFeedbackSerializer(feedback)
            return Response(serializer.data)
        except CustomerFeedback.DoesNotExist:
            return Response({'detail': 'No feedback found for this order'}, status=status.HTTP_404_NOT_FOUND)


class CustomerFeedbackViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Customer Feedback.
    """
    queryset = CustomerFeedback.objects.all()
    serializer_class = CustomerFeedbackSerializer