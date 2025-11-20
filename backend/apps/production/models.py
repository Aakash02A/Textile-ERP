from django.db import models
import uuid
from django.utils import timezone
from apps.inventory.models import RawMaterial


class BillOfMaterials(models.Model):
    """
    Bill of Materials (BOM) for products.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_code = models.CharField(max_length=50)
    raw_material = models.ForeignKey(RawMaterial, on_delete=models.CASCADE)
    quantity_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"BOM: {self.product_code} - {self.raw_material.name}"

    class Meta:
        db_table = 'production_bom'
        verbose_name = 'Bill of Materials'
        verbose_name_plural = 'Bills of Materials'


class WorkOrder(models.Model):
    """
    Work orders for production.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workorder_number = models.CharField(max_length=50, unique=True)
    product_code = models.CharField(max_length=50)
    planned_qty = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"WO: {self.workorder_number} - {self.product_code}"

    class Meta:
        db_table = 'production_workorder'
        verbose_name = 'Work Order'
        verbose_name_plural = 'Work Orders'


class WorkOrderProgress(models.Model):
    """
    Track progress of work orders through different phases.
    """
    PHASE_CHOICES = [
        ('cutting', 'Cutting'),
        ('sewing', 'Sewing'),
        ('finishing', 'Finishing'),
        ('packing', 'Packing'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='progress_updates')
    phase = models.CharField(max_length=20, choices=PHASE_CHOICES)
    completed_qty = models.DecimalField(max_digits=10, decimal_places=2)
    completed_at = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.work_order.workorder_number} - {self.phase}"

    class Meta:
        db_table = 'production_workorderprogress'
        verbose_name = 'Work Order Progress'
        verbose_name_plural = 'Work Order Progress'