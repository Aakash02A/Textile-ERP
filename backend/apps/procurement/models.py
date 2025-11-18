class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact = models.JSONField(null=True, blank=True)
    rating = models.FloatField(default=0.0)
    lead_time_days = models.IntegerField(default=0)
    quality_score = models.FloatField(default=0.0)

class RawMaterial(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    unit = models.CharField(max_length=50)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True)
    reorder_level = models.IntegerField(default=0)
    safety_stock = models.IntegerField(default=0)

class ProcurementOrder(models.Model):
    ORDER_STATUS = [('placed','Placed'), ('partial','Partial'), ('received','Received'), ('cancelled','Cancelled')]
    order_no = models.CharField(max_length=100, unique=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    created_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    status = models.CharField(max_length=32, choices=ORDER_STATUS, default='placed')
    expected_delivery = models.DateField(null=True, blank=True)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class ProcurementItem(models.Model):
    procurement = models.ForeignKey(ProcurementOrder, related_name='items', on_delete=models.CASCADE)
    raw_material = models.ForeignKey(RawMaterial, on_delete=models.PROTECT)
    qty = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    received_qty = models.IntegerField(default=0)
