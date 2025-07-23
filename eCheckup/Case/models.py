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
    ('cancelled', 'Cancelled'),
    ('submitted_to_lic', 'Submitted to LIC'),
    ('completed', 'Completed'),
]

class Case(models.Model):
    case_id = models.CharField(max_length=20, unique=True)
    case_type = models.CharField(max_length=20, choices=CASE_TYPE_CHOICES)
    policy_type = models.CharField(max_length=20, choices=[('new', 'New'), ('revival', 'Revival')])
    policy_number = models.CharField(max_length=30, null=True, blank=True)
    sum_assured = models.DecimalField(max_digits=12, decimal_places=2)
    priority = models.CharField(max_length=10, choices=[('normal', 'Normal'), ('urgent', 'Urgent')])
    due_date = models.DateField()
    payment_method = models.CharField(max_length=10, choices=[('lic', 'LIC'), ('self', 'Self')], null=True, blank=True)
    holder_name = models.CharField(max_length=255)
    holder_phone = models.CharField(max_length=15)
    holder_email = models.EmailField(blank=True, null=True)
    lic_office_code = models.CharField(max_length=10)
    assigned_coordinator_id = models.CharField(max_length=12)
    created_by = models.CharField(max_length=12)
    assigned_telecaller_id = models.CharField(max_length=12, null=True, blank=True)
    assigned_dc_id = models.CharField(max_length=12, null=True, blank=True)
    assigned_vmer_med_co_id = models.CharField(max_length=12, null=True, blank=True)
    video_url = models.TextField(blank=True, null=True)
    report_url = models.TextField(blank=True, null=True)
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


class CaseActionLog(models.Model):
    case_id = models.CharField(max_length=20)
    action_by = models.CharField(max_length=12)
    action = models.CharField(max_length=255)
    remarks = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)
