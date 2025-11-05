from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('hod', 'HOD'),
        ('coordinator', 'Coordinator'),
        ('telecaller', 'TeleCaller'),
        ('vmer_med_co', 'VmerMedCo'),
        ('diagnostic_center', 'DiagnosticCenter'),
        ('agent', 'Agent'),
        ('accounts', 'Accounts'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    user_id = models.CharField(max_length=12, unique=True)  # Login ID
    name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=15)
    device_id = models.CharField(max_length=255, null=True, blank=True, default='')

    created_at = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'user_id', 'role']

    def __str__(self):
        return f"{self.name} ({self.role})"
