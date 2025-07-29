from django.db import models
from django.utils import timezone
import random, string

CASE_TYPE_CHOICES = [
    ('vmer', 'VMER'),
    ('dc_visit', 'DC Visit'),
    ('online', 'Online'),
]

CASE_STATUS_CHOICES = [
    ('created', 'Created'),
    ('assigned', 'Assigned'),
    ('scheduled', 'Scheduled'),
    ('rescheduled', 'Rescheduled'),
    ('issue', 'Issue'),
    ('cancelled', 'Cancelled'),
    ('uploaded', 'Uploaded'),
    ('submitted_to_lic', 'Submitted to LIC'),
    ('completed', 'Completed'),
]

ISSUE_TYPE_CHOICES = [
    ('customer_not_visited', 'Customer Did Not Visit'),
    ('test_issue', 'Issue While Test'),
    ('other', 'Other'),
]

class Case(models.Model):
    case_id = models.CharField(max_length=20, unique=True)
    case_type = models.CharField(max_length=20, choices=CASE_TYPE_CHOICES)
    
    policy_type = models.CharField(max_length=20, choices=[('new', 'New'), ('revival', 'Revival')])
    policy_number = models.CharField(max_length=30, null=True, blank=True)
    sum_assured = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=[('lic', 'LIC'), ('self', 'Self')], null=True, blank=True)
    holder_name = models.CharField(max_length=255)
    holder_phone = models.CharField(max_length=15)
    holder_email = models.EmailField(blank=True, null=True)
    
    priority = models.CharField(max_length=10, choices=[('normal', 'Normal'), ('urgent', 'Urgent')])
    due_date = models.DateField()
    lic_office_code = models.CharField(max_length=10)
    created_by = models.CharField(max_length=12)
    assigned_coordinator_id = models.CharField(max_length=12)
    assigned_telecaller_id = models.CharField(max_length=12, null=True, blank=True)
    assigned_dc_id = models.CharField(max_length=12, null=True, blank=True)
    assigned_vmer_med_co_id = models.CharField(max_length=12, null=True, blank=True)
    video_url = models.TextField(blank=True, null=True)
    report_url = models.TextField(blank=True, null=True)
    issue_type = models.CharField(max_length=30, choices=ISSUE_TYPE_CHOICES, null=True, blank=True)
    issue_reason = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=CASE_STATUS_CHOICES, default='created')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)


class Schedule(models.Model):
    case_id = models.CharField(max_length=20)
    schedule_time = models.DateTimeField()
    created_by = models.CharField(max_length=12)
    reason = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):    
        if self.is_active:
            Schedule.objects.filter(case_id=self.case_id, is_active=True).exclude(pk=self.pk).update(is_active=False)

        super().save(*args, **kwargs)


class CaseActionLog(models.Model):
    case_id = models.CharField(max_length=20)
    action_by = models.CharField(max_length=12)
    action = models.CharField(max_length=255)
    remarks = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)


class DiagnosticCenter(models.Model):
    user_id = models.CharField(max_length=12, unique=True)  # Links to UserDetail.user_id
    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} - {self.city} ({self.pincode})"
    
    
class TestDetail(models.Model):
    test_id = models.CharField(max_length=12, unique=True)
    test_name = models.CharField(max_length=255)
    dc_charge = models.CharField(max_length=10)
    lic_rural_charge = models.CharField(max_length=10)
    lic_urban_charge = models.CharField(max_length=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

