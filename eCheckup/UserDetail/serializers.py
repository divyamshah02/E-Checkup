from rest_framework import serializers
from .models import User

from Case.models import DiagnosticCenter
from Case.serializers import DiagnosticCenterSerializer

from LIC.models import Agent
from LIC.serializers import AgentSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'user_id', 'name', 'email', 'contact_number', 'role', 'device_id', 'is_active', 'created_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['role'] = instance.get_role_display()

        if representation['role'] == "DiagnosticCenter" or representation['role'] == 'diagnostic_center':
            dc_data = DiagnosticCenter.objects.filter(user_id=representation['user_id']).first()
            if dc_data:
                representation['dc_data'] = DiagnosticCenterSerializer(dc_data).data
            else:
                representation['dc_data']= {}

        if representation['role'] == "agent" or representation['role'] == 'Agent':
            print('hellooo')
            agent_data = Agent.objects.filter(lic_id=representation['user_id']).first()
            print(AgentSerializer(agent_data).data)
            if agent_data:
                representation = representation.update(AgentSerializer(agent_data).data)

        return representation
