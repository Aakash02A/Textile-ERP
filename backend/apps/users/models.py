from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin','Admin'),
        ('procurement','ProcurementManager'),
        ('inventory','InventoryManager'),
        ('production','ProductionManager'),
        ('qc','QCInspector'),
        ('sales','SalesManager'),
        ('auditor','Auditor'),
    ]
    role = models.CharField(max_length=32, choices=ROLE_CHOICES)
