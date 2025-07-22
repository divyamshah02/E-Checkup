from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'name', 'email', 'role', 'is_active', 'created_at')
    search_fields = ('name', 'email', 'user_id', 'contact_number')
    list_filter = ('role', 'is_active', 'created_at')
