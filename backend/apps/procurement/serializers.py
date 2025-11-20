from rest_framework import serializers
from .models import Supplier, PurchaseOrder, PurchaseItem
from apps.inventory.models import RawMaterial


class SupplierSerializer(serializers.ModelSerializer):
    """
    Serializer for Supplier model.
    """
    class Meta:
        model = Supplier
        fields = '__all__'
        read_only_fields = ('created_at',)


class PurchaseItemSerializer(serializers.ModelSerializer):
    """
    Serializer for PurchaseItem model.
    """
    raw_material_name = serializers.CharField(source='raw_material.name', read_only=True)
    
    class Meta:
        model = PurchaseItem
        fields = '__all__'
        read_only_fields = ('created_at',)


class PurchaseOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for PurchaseOrder model.
    """
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    items = PurchaseItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating PurchaseOrder with items.
    """
    items = PurchaseItemSerializer(many=True)
    
    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'total_cost')
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data['created_by'] = self.context['request'].user
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        total_cost = 0
        for item_data in items_data:
            PurchaseItem.objects.create(purchaseorder=purchase_order, **item_data)
            total_cost += item_data['unit_price'] * item_data['quantity']
            
        purchase_order.total_cost = total_cost
        purchase_order.save()
        
        return purchase_order


class PurchaseOrderUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating PurchaseOrder status.
    """
    class Meta:
        model = PurchaseOrder
        fields = ['status']