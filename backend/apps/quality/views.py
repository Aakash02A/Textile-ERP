from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DefectLog
from .serializers import DefectLogSerializer, DefectLogCreateSerializer, DefectPredictionSerializer
from core.tasks import perform_ml_inference


class DefectLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Defect Logs.
    """
    queryset = DefectLog.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DefectLogCreateSerializer
        return DefectLogSerializer
    
    def perform_create(self, serializer):
        # Automatically set the detected_by field to the current user
        serializer.save(detected_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def predict(self, request):
        """
        Send images for ML defect detection.
        """
        serializer = DefectPredictionSerializer(data=request.data)
        
        if serializer.is_valid():
            # In a real implementation, this would process the images
            # and call the ML model for prediction
            # For now, we'll just simulate the process
            
            # Trigger async inference task
            task_result = perform_ml_inference.delay('defect_detection', {
                'image_data': serializer.validated_data.get('image_data', []),
                'image_paths': serializer.validated_data.get('image_paths', [])
            })
            
            return Response({
                'message': 'Defect detection started',
                'task_id': task_result.id
            }, status=status.HTTP_202_ACCEPTED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get defect summary statistics.
        """
        total_defects = DefectLog.objects.count()
        defects_by_type = DefectLog.objects.values('defect_type').annotate(count=models.Count('defect_type'))
        defects_by_severity = DefectLog.objects.values('severity').annotate(count=models.Count('severity'))
        
        return Response({
            'total_defects': total_defects,
            'defects_by_type': defects_by_type,
            'defects_by_severity': defects_by_severity
        })