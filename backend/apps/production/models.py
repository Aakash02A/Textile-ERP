class ProductionBatch(models.Model):
    batch_no = models.CharField(max_length=100, unique=True)
    product_sku = models.CharField(max_length=100)
    planned_qty = models.IntegerField()
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default='planned')
    defects_count = models.IntegerField(default=0)

class ProductionPhase(models.Model):
    batch = models.ForeignKey(ProductionBatch, related_name='phases', on_delete=models.CASCADE)
    phase_name = models.CharField(max_length=100)  # cutting, stitching, finishing
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='pending')
    operator = models.ForeignKey('users.User', null=True, on_delete=models.SET_NULL)
