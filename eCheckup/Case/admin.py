from django.contrib import admin
from .models import *


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('case_id', 'case_type', 'insurance_company', 'holder_name', 'assigned_coordinator_id', 'status', 'is_active', 'created_at')
    search_fields = ('case_id', 'holder_name', 'holder_phone', 'holder_email', 'assigned_coordinator_id', 'ins_office_code')
    list_filter = ('case_type', 'insurance_company', 'status', 'is_active')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('case_id', 'schedule_time', 'created_by', 'is_active', 'created_at')
    search_fields = ('case_id', 'created_by')
    list_filter = ('is_active',)


@admin.register(CaseActionLog)
class CaseActionLogAdmin(admin.ModelAdmin):
    list_display = ('case_id', 'action_by', 'action', 'timestamp')
    search_fields = ('case_id', 'action_by', 'action')
    readonly_fields = ('timestamp',)


@admin.register(DiagnosticCenter)
class DiagnosticCenterAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'pincode', 'contact_person', 'user_id', 'is_active']
    search_fields = ['name', 'city', 'pincode', 'user_id']
    list_filter = ['city', 'state', 'is_active']


@admin.register(TestDetail)
class TestDetailAdmin(admin.ModelAdmin):
    list_display = ['test_name', 'dc_charge', 'lic_rural_charge', 'lic_urban_charge']
    search_fields = ['test_name',]


@admin.register(InsuranceCompany)
class InsuranceCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'has_hierarchy', 'is_active', 'created_at')
    search_fields = ('name', 'code')
    list_filter = ('has_hierarchy', 'is_active')
    readonly_fields = ('company_id', 'created_at')


@admin.register(TataAIGOffice)
class TataAIGOfficeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'city', 'state', 'is_active', 'created_at')
    search_fields = ('code', 'name', 'city', 'state')
    list_filter = ('state', 'is_active')
    readonly_fields = ('office_id', 'created_at')
