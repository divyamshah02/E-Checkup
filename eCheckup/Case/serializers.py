from rest_framework import serializers
from .models import *


class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = '__all__'


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'


class CaseActionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseActionLog
        fields = '__all__'


class DiagnosticCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosticCenter
        fields = '__all__'

