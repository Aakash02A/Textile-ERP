from rest_framework import serializers
from .models import SalesOrder, SalesOrderItem, CustomerFeedback


class SalesOrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for Sales Order Items.
    """
    class Meta:
        model = SalesOrderItem
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'total_price')


class SalesOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Sales Orders.
    """
    items = SalesOrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = SalesOrder
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class SalesOrderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating Sales Orders with items.
    """
    items = SalesOrderItemSerializer(many=True)
    
    class Meta:
        model = SalesOrder
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sales_order = SalesOrder.objects.create(**validated_data)
        
        total_value = 0
        for item_data in items_data:
            item = SalesOrderItem.objects.create(sales_order=sales_order, **item_data)
            total_value += item.total_price
            
        sales_order.total_value = total_value
        sales_order.save()
        
        return sales_order


class CustomerFeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for Customer Feedback.
    """
    order_number = serializers.CharField(source='sales_order.order_number', read_only=True)
    
    class Meta:
        model = CustomerFeedback
        fields = '__all__'
        read_only_fields = ('created_at',)