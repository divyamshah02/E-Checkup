from django.db import models
from django.utils import timezone

class HeadOffice(models.Model):
    lic_id = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

class RegionalOffice(models.Model):
    lic_id = models.CharField(max_length=10, unique=True)
    head_office_id = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

class DivisionalOffice(models.Model):
    lic_id = models.CharField(max_length=10, unique=True)
    regional_office_id = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

class BranchOffice(models.Model):
    lic_id = models.CharField(max_length=10, unique=True)
    divisional_office_id = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

class DevelopmentOfficer(models.Model):
    lic_id = models.CharField(max_length=10, unique=True)
    branch_office_id = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    created_at = models.DateTimeField(default=timezone.now)

class Agent(models.Model):
    lic_id = models.CharField(max_length=10, unique=True)
    development_officer_id = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    created_at = models.DateTimeField(default=timezone.now)
