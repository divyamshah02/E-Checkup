from django.db import models
from django.utils import timezone
import random
import string


def generate_unique_id(model, prefix, length=10, field_name="lic_id"):
    """
    Generate a unique ID with a given prefix and numeric suffix.

    Example: HO1234567890
    """
    while True:
        random_id = ''.join(random.choices(string.digits, k=length))
        full_id = prefix + random_id
        if not model.objects.filter(**{field_name: full_id}).exists():
            return full_id
        

class HeadOffice(models.Model):
    lic_id = models.CharField(max_length=12, unique=True, editable=False)  
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.lic_id:  # generate only on create
            self.lic_id = generate_unique_id(HeadOffice, "HO")
        super().save(*args, **kwargs)


class RegionalOffice(models.Model):
    lic_id = models.CharField(max_length=12, unique=True, editable=False)
    head_office_id = models.CharField(max_length=12)  # consider FK later
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.lic_id:
            self.lic_id = generate_unique_id(RegionalOffice, "RO")
        super().save(*args, **kwargs)


class DivisionalOffice(models.Model):
    lic_id = models.CharField(max_length=12, unique=True, editable=False)
    regional_office_id = models.CharField(max_length=12)
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.lic_id:
            self.lic_id = generate_unique_id(DivisionalOffice, "DO")
        super().save(*args, **kwargs)


class BranchOffice(models.Model):
    lic_id = models.CharField(max_length=12, unique=True, editable=False)
    divisional_office_id = models.CharField(max_length=12)
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.lic_id:
            self.lic_id = generate_unique_id(BranchOffice, "BO")
        super().save(*args, **kwargs)


class DevelopmentOfficer(models.Model):
    lic_id = models.CharField(max_length=12, unique=True, editable=False)
    branch_office_id = models.CharField(max_length=12)
    name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.lic_id:
            self.lic_id = generate_unique_id(DevelopmentOfficer, "DE")
        super().save(*args, **kwargs)


class Agent(models.Model):
    lic_id = models.CharField(max_length=12, unique=True, editable=False)
    development_officer_id = models.CharField(max_length=12)
    name = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.lic_id:
            self.lic_id = generate_unique_id(Agent, "AG")
        super().save(*args, **kwargs)
