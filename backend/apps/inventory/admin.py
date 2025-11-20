from django.contrib import admin
from .models import RawMaterial, StockLot

@admin.register(RawMaterial)
class RawMaterialAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'unit', 'safety_stock_level', 'reorder_point', 'created_at')
    search_fields = ('code', 'name')

@admin.register(StockLot)
class StockLotAdmin(admin.ModelAdmin):
    list_display = ('rawmaterial', 'batch_no', 'quantity_on_hand', 'location', 'received_date', 'created_at')
    list_filter = ('location', 'received_date')
    search_fields = ('rawmaterial__name', 'batch_no')