class QualityCheck(models.Model):
    QC_TYPES = [('washing','Washing'), ('ironing','Ironing'), ('sampling','Sampling'), ('packing','Packing')]
    batch = models.ForeignKey(ProductionBatch, on_delete=models.CASCADE)
    qc_type = models.CharField(max_length=50, choices=QC_TYPES)
    inspector = models.ForeignKey('users.User', on_delete=models.PROTECT)
    defects_found = models.IntegerField(default=0)
    pass_fail = models.BooleanField(default=True)
    notes = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='qc_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
