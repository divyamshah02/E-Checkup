from rest_framework import serializers
from .models import *

class BaseLICSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'

class HeadOfficeSerializer(BaseLICSerializer):
    class Meta(BaseLICSerializer.Meta):
        model = HeadOffice

class RegionalOfficeSerializer(BaseLICSerializer):
    class Meta(BaseLICSerializer.Meta):
        model = RegionalOffice

class DivisionalOfficeSerializer(BaseLICSerializer):
    class Meta(BaseLICSerializer.Meta):
        model = DivisionalOffice

class BranchOfficeSerializer(BaseLICSerializer):
    class Meta(BaseLICSerializer.Meta):
        model = BranchOffice

class DevelopmentOfficerSerializer(BaseLICSerializer):
    class Meta(BaseLICSerializer.Meta):
        model = DevelopmentOfficer

class AgentSerializer(BaseLICSerializer):
    class Meta(BaseLICSerializer.Meta):
        model = Agent
