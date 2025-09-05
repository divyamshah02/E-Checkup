from django.db import models
from django.utils import timezone
import random, string

CASE_TYPE_CHOICES = [
    ('vmer', 'VMER'),
    ('dc_visit', 'DC Visit'),
    ('online', 'Online'),
    ('both', 'Both'),
]

CASE_STAGE_CHOICES = [
    ('vmer', 'VMER'),
    ('dc_visit', 'DC Visit')
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
    
    case_stage = models.CharField(max_length=20, choices=CASE_STAGE_CHOICES, blank=True, null=True, default="vmer")
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
    
    lic_gst_no = models.CharField(max_length=255, null=True, blank=True)
    lic_type = models.CharField(choices=[('urban', 'Urban'), ('rural', 'Rural')], max_length=10,)
    intimation_date = models.DateField(null=True, blank=True)
    holder_dob = models.DateField(null=True, blank=True)
    holder_gender = models.CharField(choices=[('M', 'M'), ('F', 'F')], null=True, blank=True, max_length=1,)
    holder_address = models.TextField(null=True, blank=True)
    holder_state = models.CharField(max_length=255, null=True, blank=True) 
    holder_city = models.CharField(max_length=255, null=True, blank=True) 
    holder_pincode = models.CharField(max_length=10, null=True, blank=True)
    proposed_sum_insured = models.CharField(max_length=255, null=True, blank=True)
    sum_insured_under_consideration = models.CharField(max_length=255, null=True, blank=True)
    tests = models.JSONField(default=list)
    test_price = models.JSONField(default=dict)


    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)


class Schedule(models.Model):
    case_id = models.CharField(max_length=20)
    schedule_time = models.DateTimeField()
    schedule_type = models.CharField(max_length=8, null=True, blank=True)
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
    

def generate_unique_id(field_name="test_id"):
    while True:
        random_id = ''.join(random.choices(string.digits, k=10))
        full_id = random_id
        if not TestDetail.objects.filter(**{field_name: full_id}).exists():
            return full_id
        
    
class TestDetail(models.Model):
    test_id = models.CharField(max_length=12, unique=True, null=True, blank=True)
    test_name = models.CharField(max_length=255)
    dc_charge = models.CharField(max_length=10)
    lic_rural_charge = models.CharField(max_length=10)
    lic_urban_charge = models.CharField(max_length=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.test_id:  # generate only on create
            self.test_id = generate_unique_id()
        super().save(*args, **kwargs)

class TelecallerRemark(models.Model):
    case_id = models.CharField(max_length=12, null=True, blank=True)
    telecaller_id = models.CharField(max_length=12)  # UserDetail.user_id of telecaller
    remark = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Remark by {self.telecaller_id} on {self.case.case_id}"
