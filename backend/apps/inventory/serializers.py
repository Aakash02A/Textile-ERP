from rest_framework import serializers
from .models import RawMaterial, StockLot


class RawMaterialSerializer(serializers.ModelSerializer):
    """
    Serializer for RawMaterial model.
    """
    class Meta:
        model = RawMaterial
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class StockLotSerializer(serializers.ModelSerializer):
    """
    Serializer for StockLot model.
    """
    raw_material_name = serializers.CharField(source='rawmaterial.name', read_only=True)
    
    class Meta:
        model = StockLot
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class StockLotReceiveSerializer(serializers.ModelSerializer):
    """
    Serializer for receiving stock lots.
    """
    class Meta:
        model = StockLot
        fields = ['rawmaterial', 'batch_no', 'quantity_on_hand', 'location', 'received_date', 'expiry_date', 'unit_cost']


class StockTransferSerializer(serializers.Serializer):
    """
    Serializer for transferring stock between locations.
    """
    rawmaterial_id = serializers.UUIDField()
    batch_no = serializers.CharField(max_length=50)
    from_location = serializers.CharField(max_length=100)
    to_location = serializers.CharField(max_length=100)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)