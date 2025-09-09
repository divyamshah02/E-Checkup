from rest_framework import viewsets, status
from rest_framework.response import Response
from utils.decorators import handle_exceptions, check_authentication
from .models import *
from .serializers import *

LIC_MODELS = [
    (HeadOffice, HeadOfficeSerializer),
    (RegionalOffice, RegionalOfficeSerializer),
    (DivisionalOffice, DivisionalOfficeSerializer),
    (BranchOffice, BranchOfficeSerializer),
    (DevelopmentOfficer, DevelopmentOfficerSerializer),
    (Agent, AgentSerializer),
]


def create_viewset(model_class, serializer_class):
    class GenericLICViewSet(viewsets.ViewSet):

        @handle_exceptions
        # @check_authentication(required_role='admin')
        def create(self, request):
            serializer = serializer_class(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"success": True, "data": serializer.data, "error": None}, status=status.HTTP_201_CREATED)
            return Response({"success": False, "data": None, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        @handle_exceptions
        def list(self, request):
            lic_id = request.query_params.get("id")
            if lic_id:
                obj = model_class.objects.filter(lic_id=lic_id).first()
                if not obj:
                    return Response({"success": False, "data": None, "error": "Not found."}, status=404)
                serializer = serializer_class(obj)
                return Response({"success": True, "data": serializer.data, "error": None})
            
            all_objs = model_class.objects.all()
            serializer = serializer_class(all_objs, many=True)
            return Response({"success": True, "data": serializer.data, "error": None})

        @handle_exceptions
        # @check_authentication(required_role='admin')
        def update(self, request, pk=None):
            obj = model_class.objects.filter(id=pk).first()
            if not obj:
                return Response({"success": False, "data": None, "error": "Not found."}, status=404)

            serializer = serializer_class(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"success": True, "data": serializer.data, "error": None})
            return Response({"success": False, "data": None, "error": serializer.errors}, status=400)

        @handle_exceptions
        # @check_authentication(required_role='admin')
        def destroy(self, request, pk=None):
            obj = model_class.objects.filter(id=pk).first()
            if not obj:
                return Response({"success": False, "data": None, "error": "Not found."}, status=404)
            obj.delete()
            return Response({"success": True, "data": {"id": pk, "deleted": True}, "error": None})

    return GenericLICViewSet

HeadOfficeViewSet = create_viewset(HeadOffice, HeadOfficeSerializer)
RegionalOfficeViewSet = create_viewset(RegionalOffice, RegionalOfficeSerializer)
DivisionalOfficeViewSet = create_viewset(DivisionalOffice, DivisionalOfficeSerializer)
BranchOfficeViewSet = create_viewset(BranchOffice, BranchOfficeSerializer)
DevelopmentOfficerViewSet = create_viewset(DevelopmentOfficer, DevelopmentOfficerSerializer)
AgentViewSet = create_viewset(Agent, AgentSerializer)



class OfficeHierarchyViewSet(viewsets.ViewSet):
    """
    Returns nested office data in the format:
    {
      "Regional Office": {
        "Divisional Office": {
          "Branch Office": ["Agent 1", "Agent 2"]
        }
      }
    }
    """
    @check_authentication(required_role=['admin', 'hod', 'coordinator'])
    @handle_exceptions
    def list(self, request):
        data = {}

        regional_offices = RegionalOffice.objects.all()

        for regional in regional_offices:
            regional_dict = {}
            divisional_offices = DivisionalOffice.objects.filter(
                regional_office_id=regional.lic_id
            )

            for divisional in divisional_offices:
                divisional_dict = {}
                branch_offices = BranchOffice.objects.filter(
                    divisional_office_id=divisional.lic_id
                )

                for branch in branch_offices:
                    # Get development officers under branch
                    dev_officers = DevelopmentOfficer.objects.filter(
                        branch_office_id=branch.lic_id
                    )
                    # Collect agents under each development officer
                    agents = Agent.objects.filter(
                        development_officer_id__in=dev_officers.values_list("lic_id", flat=True)
                    ).values_list("name", flat=True)

                    divisional_dict[branch.name] = list(agents)

                regional_dict[divisional.name] = divisional_dict

            data[regional.name] = regional_dict

        return Response({
            "success": True,
            "data": data,
            "error": None
        }, status=status.HTTP_200_OK)

