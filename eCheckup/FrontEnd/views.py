from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.exceptions import NotFound, ParseError
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse

from Case.models import Case # Import the Case model

from utils.decorators import check_authentication, handle_exceptions


class HomeViewSet(viewsets.ViewSet):
    
    @handle_exceptions
    def list(self, request):
        user = request.user
        if user.is_authenticated:
            return redirect('dashboard-list')
        else:
            return redirect('login-list')


class LoginViewSet(viewsets.ViewSet):
    
    @handle_exceptions
    def list(self, request):
        return render(request, 'login.html')


class DashboardViewSet(viewsets.ViewSet):
    
    @handle_exceptions
    def list(self, request):
        user = request.user
        if user.is_authenticated:
            role = user.role.lower() if user.role else ''

            # Map roles to their respective dashboard templates
            template_map = {
                'hod': 'HOD/dashboard.html',
                'coordinator': 'Coordinator/dashboard.html',
                'telecaller': 'TeleCaller/dashboard.html',
                'diagnostic_center': 'DC/dashboard.html',
            }

            template_name = template_map.get(role)

            if template_name:
                return render(request, template_name)
            else:            
                return redirect('login-list')
        
        else:
            return redirect('login-list')


class CaseDetailViewSet(viewsets.ViewSet):

    @check_authentication()
    @handle_exceptions
    def list(self, request):
        user = request.user
        if user.is_authenticated:
            print(user.role)
            role = user.role.lower()
            print(role)
            case_id = request.query_params.get('case_id')
            print(case_id)

            try:        
                case_instance = get_object_or_404(Case, case_id=case_id)
                print(case_instance.case_type)
            except Case.DoesNotExist:
                raise NotFound(detail="Error 404, Case not found", code=404)

            case_type = case_instance.case_type.lower()

            user_role_template_map = {
                'admin': 'Admin',
                'hod': 'HOD',
                'coordinator': 'Coordinator',
                'telecaller': 'TeleCaller',
                'vmer_med_co': 'VmerMedCo',
                'diagnostic_center': 'DiagnosticCenter',
                'lic': 'LIC',
            }

            template_map = {
                'vmer': 'vmer-case-details.html',
                'dc_visit': 'dc-visit-case-details.html',
                'online': 'online-case-details.html',
            }

            template_name = template_map.get(case_type)
            role_name = user_role_template_map.get(role)

            file_name = f"{role_name}/{template_name}" if role_name and template_name else None

            if file_name:
                return render(request, file_name)
            else:
                # Fallback or error page if case type is unknown
                return redirect('dashboard-list')

        else:
            return redirect('login-list')