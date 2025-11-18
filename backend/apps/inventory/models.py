class InventoryItem(models.Model):
    material = models.ForeignKey(RawMaterial, on_delete=models.CASCADE)
    sku = models.CharField(max_length=100)
    location = models.CharField(max_length=255, null=True, blank=True)
    qty_on_hand = models.IntegerField(default=0)
    qty_reserved = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

class Accessory(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    qty_on_hand = models.IntegerField(default=0)
    supplier = models.ForeignKey(Supplier, null=True, on_delete=models.SET_NULL)
