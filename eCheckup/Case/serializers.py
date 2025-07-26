from rest_framework import serializers
from .models import *

from UserDetail.models import User

class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = '__all__'


class CaseDetailSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format='%H:%M | %d-%m-%Y')
    class Meta:
        model = Case
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if 'case_id' in representation:
            all_case_logs = CaseActionLog.objects.filter(case_id=representation['case_id'])
            representation['case_logs'] = CaseActionLogSerializer(all_case_logs, many=True).data
        if 'assigned_coordinator_id' in representation:
            coordinator = User.objects.filter(user_id=representation['assigned_coordinator_id']).first()
            if coordinator:
                representation['assigned_coordinator'] = {
                    'id': coordinator.id,
                    'name': coordinator.name,
                    'email': coordinator.email
                } 
        
        if 'assigned_dc_id' in representation:
            if representation['assigned_dc_id']:
                dc = User.objects.filter(user_id=representation['assigned_dc_id']).first()
                if dc:
                    dc_details = DiagnosticCenter.objects.filter(user_id=dc.user_id).first()
                    representation['assigned_dc'] = {
                        'id': dc.id,
                        'name': dc.name,
                        'email': dc.email,
                        'dc_name': dc_details.name,
                        'dc_address': dc_details.address,
                        'dc_city': dc_details.city,
                        'dc_state': dc_details.state,
                        'dc_pincode': dc_details.pincode,
                    } 

        if 'assigned_vmer_med_co_id' in representation:
            vmer_med_co = User.objects.filter(user_id=representation['assigned_vmer_med_co_id']).first()
            if vmer_med_co:
                representation['assigned_vmer_med_co'] = {
                    'id': vmer_med_co.id,
                    'name': vmer_med_co.name,
                    'email': vmer_med_co.email
                } 

        return representation

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'


class CaseActionLogSerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(format='%H:%M | %d-%m-%Y')
    class Meta:
        model = CaseActionLog
        fields = '__all__'

    def to_representation(self, instance):
            representation = super().to_representation(instance)
            
            # if 'timestamp' in representation:
            #     representation['timestamp'] = instance.timestamp.strftime('%H:%M | %d-%m-%Y')
            #     print(representation['timestamp'])

            if 'action_by' in representation:
                user_details = User.objects.filter(user_id=representation['action_by']).first()
                if user_details:
                    representation['action_by_name'] = user_details.name
                    representation['action_by_role'] = user_details.role
            return representation


class DiagnosticCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosticCenter
        fields = '__all__'

