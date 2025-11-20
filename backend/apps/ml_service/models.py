from django.db import models
import uuid
from django.utils import timezone


class ModelMeta(models.Model):
    """
    Model to store metadata about ML models.
    """
    MODEL_TYPES = [
        ('lstm', 'LSTM'),
        ('rf', 'Random Forest'),
        ('lr', 'Logistic Regression'),
        ('svm', 'Support Vector Machine'),
        ('cnn', 'Convolutional Neural Network'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    model_type = models.CharField(max_length=10, choices=MODEL_TYPES)
    version = models.CharField(max_length=20)
    path_on_disk = models.CharField(max_length=255)
    metrics_json = models.TextField(blank=True, null=True)
    last_trained_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.model_type} v{self.version})"

    class Meta:
        db_table = 'mlservice_modelmeta'
        verbose_name = 'ML Model Metadata'
        verbose_name_plural = 'ML Model Metadata'