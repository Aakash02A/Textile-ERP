from rest_framework import serializers
from .models import DefectLog


class DefectLogSerializer(serializers.ModelSerializer):
    """
    Serializer for Defect Logs.
    """
    detected_by_name = serializers.CharField(source='detected_by.full_name', read_only=True)
    
    class Meta:
        model = DefectLog
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class DefectLogCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating Defect Logs.
    """
    class Meta:
        model = DefectLog
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class DefectPredictionSerializer(serializers.Serializer):
    """
    Serializer for defect prediction requests.
    """
    image_data = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    image_paths = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    
    def validate(self, data):
        image_data = data.get('image_data')
        image_paths = data.get('image_paths')
        
        if not image_data and not image_paths:
            raise serializers.ValidationError("Either image_data or image_paths must be provided")
            
        return data