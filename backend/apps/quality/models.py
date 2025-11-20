from django.db import models
import uuid
from django.utils import timezone
from apps.users.models import User


class DefectLog(models.Model):
    """
    Log defects detected during quality control processes.
    """
    DEFECT_TYPES = [
        ('color_variation', 'Color Variation'),
        ('fabric_flaw', 'Fabric Flaw'),
        ('stitching_issue', 'Stitching Issue'),
        ('dimensional_deviation', 'Dimensional Deviation'),
        ('printing_defect', 'Printing Defect'),
        ('other', 'Other'),
    ]
    
    SEVERITY_LEVELS = [
        ('minor', 'Minor'),
        ('major', 'Major'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sample_image_path = models.CharField(max_length=255, blank=True, null=True)
    defect_type = models.CharField(max_length=30, choices=DEFECT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    detected_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    detected_at = models.DateTimeField(default=timezone.now)
    production_batch_id = models.CharField(max_length=100)
    ml_flag = models.BooleanField(default=False)
    ml_confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Defect: {self.defect_type} - {self.severity} ({self.production_batch_id})"

    class Meta:
        db_table = 'quality_defect_log'
        verbose_name = 'Defect Log'
        verbose_name_plural = 'Defect Logs'