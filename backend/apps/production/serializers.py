from rest_framework import serializers
from .models import BillOfMaterials, WorkOrder, WorkOrderProgress


class BillOfMaterialsSerializer(serializers.ModelSerializer):
    """
    Serializer for Bill of Materials.
    """
    raw_material_name = serializers.CharField(source='raw_material.name', read_only=True)
    
    class Meta:
        model = BillOfMaterials
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class WorkOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Work Orders.
    """
    class Meta:
        model = WorkOrder
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class WorkOrderProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for Work Order Progress.
    """
    work_order_number = serializers.CharField(source='work_order.workorder_number', read_only=True)
    
    class Meta:
        model = WorkOrderProgress
        fields = '__all__'
        read_only_fields = ('created_at',)


class WorkOrderProgressUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating work order progress.
    """
    phase = serializers.ChoiceField(choices=WorkOrderProgress.PHASE_CHOICES)
    completed_qty = serializers.DecimalField(max_digits=10, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True)