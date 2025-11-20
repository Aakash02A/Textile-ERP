from django.db import models
import uuid
from django.utils import timezone


class RawMaterial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    unit = models.CharField(max_length=32)
    safety_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_point = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        db_table = 'inventory_rawmaterial'
        verbose_name = 'Raw Material'
        verbose_name_plural = 'Raw Materials'


class StockLot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rawmaterial = models.ForeignKey(RawMaterial, on_delete=models.CASCADE)
    batch_no = models.CharField(max_length=50)
    quantity_on_hand = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=100)
    received_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.rawmaterial.name} - {self.batch_no}"

    class Meta:
        db_table = 'inventory_stocklot'
        verbose_name = 'Stock Lot'
        verbose_name_plural = 'Stock Lots'
        unique_together = ('rawmaterial', 'batch_no')