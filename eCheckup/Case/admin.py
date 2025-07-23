from django.contrib import admin
from .models import Case, Schedule, CaseActionLog


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('case_id', 'case_type', 'holder_name', 'assigned_coordinator_id', 'status', 'is_active', 'created_at')
    search_fields = ('case_id', 'holder_name', 'holder_phone', 'holder_email', 'assigned_coordinator_id')
    list_filter = ('case_type', 'status', 'is_active')
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
