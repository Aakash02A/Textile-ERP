from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ModelMeta
from .serializers import ModelMetaSerializer, ModelTrainingSerializer, ModelPredictionSerializer
from .trainers import ModelTrainer
from .infer import ModelInference
from core.tasks import perform_ml_training, perform_ml_inference


class ModelMetaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing ML model metadata.
    """
    queryset = ModelMeta.objects.all()
    serializer_class = ModelMetaSerializer
    
    @action(detail=False, methods=['post'])
    def train(self, request):
        """
        Trigger model training asynchronously.
        """
        serializer = ModelTrainingSerializer(data=request.data)
        if serializer.is_valid():
            model_type = serializer.validated_data['model_type']
            training_data_path = serializer.validated_data.get('training_data_path')
            parameters = serializer.validated_data.get('parameters', {})
            
            # Trigger async training task
            task_result = perform_ml_training.delay(model_type, {
                'training_data_path': training_data_path,
                'parameters': parameters
            })
            
            return Response({
                'message': 'Model training started',
                'task_id': task_result.id
            }, status=status.HTTP_202_ACCEPTED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def predict(self, request, pk=None):
        """
        Perform model inference.
        """
        model_meta = self.get_object()
        serializer = ModelPredictionSerializer(data=request.data)
        
        if serializer.is_valid():
            input_data = serializer.validated_data['input_data']
            
            try:
                # Perform inference
                inference_engine = ModelInference(model_meta)
                result = inference_engine.predict(input_data)
                
                return Response(result, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)