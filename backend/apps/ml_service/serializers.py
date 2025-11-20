from rest_framework import serializers
from .models import ModelMeta


class ModelMetaSerializer(serializers.ModelSerializer):
    """
    Serializer for ModelMeta model.
    """
    class Meta:
        model = ModelMeta
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'last_trained_at')


class ModelTrainingSerializer(serializers.Serializer):
    """
    Serializer for model training requests.
    """
    model_type = serializers.ChoiceField(choices=[choice[0] for choice in ModelMeta.MODEL_TYPES])
    training_data_path = serializers.CharField(max_length=255, required=False)
    parameters = serializers.DictField(required=False)


class ModelPredictionSerializer(serializers.Serializer):
    """
    Serializer for model prediction requests.
    """
    model_id = serializers.UUIDField()
    input_data = serializers.DictField()