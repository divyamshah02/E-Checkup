import random
import string

from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404, redirect

from rest_framework import viewsets, status
from rest_framework.response import Response

from .models import User
from .serializers import UserSerializer
from utils.decorators import handle_exceptions, check_authentication

from Case.models import DiagnosticCenter
from LIC.models import *

class UserCreationViewSet(viewsets.ViewSet):

    @handle_exceptions
    @check_authentication(required_role=['admin', 'hod', 'coordinator'])
    def create(self, request):
        name = request.data.get('name')
        password = request.data.get('password')
        contact_number = request.data.get('contact_number')
        email = request.data.get('email')
        role = str(request.data.get('role')).lower()

        contact_person = request.data.get("contact_person")
        address = request.data.get("address")
        city = request.data.get("city")
        state = request.data.get("state")
        pincode = request.data.get("pincode")

        development_officer_id = request.data.get('development_officer_id')

        role_codes = {
            'hod': 'HO',
            'coordinator': 'CO',
            'telecaller': 'TC',
            'vmer_med_co': 'VM',
            'diagnostic_center': 'DC',
            'agent': 'AG',
            'admin': 'AD',
            'accounts': 'AC',
        }

        if not name or not contact_number or not email or not role:
            return Response({"success": False, "error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        if role not in role_codes:
            return Response({"success": False, "error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)
        same_email = User.objects.filter(is_active=True, email=email).exists()
        same_contact = User.objects.filter(is_active=True, contact_number=contact_number).exists()
        if same_email or same_contact:
            return Response({"success": False, "error": f"User already registered. Same Email - {same_email}, Same Number - {same_contact}"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = self.generate_user_id(role_codes[role])

        if role == 'admin':
            user = User.objects.create_superuser(
                username=user_id,
                user_id=user_id,
                password=password,
                name=name,
                email=email,
                contact_number=contact_number,
                role=role
            )
        else:
            user = User.objects.create_user(
                username=user_id,
                user_id=user_id,
                password=password,
                name=name,
                email=email,
                contact_number=contact_number,
                role=role
            )

        if request.data.get('role') == "diagnosticcenter" or request.data.get('role') == 'diagnostic_center':
            # Create Diagnostic Center entry
            dc = DiagnosticCenter.objects.create(
                user_id=user_id,
                name=name,
                address=address,
                city=city,
                state=state,
                pincode=pincode,
                contact_person=contact_person,
                contact_number=contact_number
            )

        if request.data.get('role') == "agent":
            # Create Diagnostic Center entry
            dc = Agent.objects.create(
                lic_id=user_id,
                name=name,
                development_officer_id=development_officer_id,
                contact_number=contact_number
            )


        serializer = UserSerializer(user)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_201_CREATED)

    def generate_user_id(self, role_code):
        while True:
            random_id = ''.join(random.choices(string.digits, k=10))
            full_id = role_code + random_id
            if not User.objects.filter(user_id=full_id).exists():
                return full_id

    @handle_exceptions
    @check_authentication(required_role=['admin', 'hod', 'coordinator'])
    def list(self, request):
        user_id = request.query_params.get("user_id")
        role = request.query_params.get("role")

        if user_id:
            user = get_object_or_404(User, user_id=user_id)
            data = UserSerializer(user).data
        elif role:
            users = User.objects.filter(role=role, is_active=True)
            data = UserSerializer(users, many=True).data
        else:
            users = User.objects.filter(is_active=True)
            if request.user.role == "hod":
                users = users.exclude(role__in=["admin", "hod"])
            if request.user.role == "coordinator":
                users = users.exclude(role__in=["admin", "hod", "coordinator"])
            data = UserSerializer(users, many=True).data

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": data,
            "error": None
        }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication(required_role=['admin', 'hod', 'coordinator'])
    def update(self, request, pk=None):
        user = User.objects.filter(id=pk, is_active=True).first()
        if not user:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "User not found."
            }, status=status.HTTP_404_NOT_FOUND)

        user.name = request.data.get('name', user.name)
        user.contact_number = request.data.get('contact_number', user.contact_number)
        user.email = request.data.get('email', user.email)
        user.device_id = request.data.get('device_id', user.device_id)
        user.save()

        if request.data.get('role') == "DiagnosticCenter" or request.data.get('role') == 'diagnostic_center':
            dc_data = DiagnosticCenter.objects.get(user_id=user.user_id)
            dc_data.contact_person = request.data.get("contact_person", dc_data.contact_person)
            dc_data.address = request.data.get("address", dc_data.address)
            dc_data.city = request.data.get("city", dc_data.city)
            dc_data.state = request.data.get("state", dc_data.state)
            dc_data.pincode = request.data.get("pincode", dc_data.pincode)
            dc_data.save()

        serializer = UserSerializer(user)
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": serializer.data,
            "error": None
        }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication(required_role=['admin', 'hod', 'coordinator'])
    def destroy(self, request, pk=None):
        user = User.objects.filter(id=pk, is_active=True).first()
        if not user:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "User not found."
            }, status=status.HTTP_404_NOT_FOUND)

        user.is_active = False
        user.save()

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": {"id": pk, "deleted": True},
            "error": None
        }, status=status.HTTP_200_OK)


class LoginApiViewSet(viewsets.ViewSet):

    @handle_exceptions
    def create(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({
                "success": False,
                "user_does_not_exist": False,
                "wrong_password": False,
                "error": "Email and password are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            return Response({
                "success": False,
                "user_does_not_exist": True,
                "wrong_password": False,
                "error": None
            }, status=status.HTTP_404_NOT_FOUND)

        authenticated = authenticate(request, username=user.user_id, password=password)
        if not authenticated:
            return Response({
                "success": False,
                "user_does_not_exist": False,
                "wrong_password": True,
                "error": None
            }, status=status.HTTP_401_UNAUTHORIZED)

        login(request, authenticated)
        # request.session.set_expiry(30 * 60)  # 30 minutes

        return Response({
            "success": True,
            "user_does_not_exist": False,
            "wrong_password": False,
            "error": None,
            "data": {"user_id": user.user_id}
        }, status=status.HTTP_200_OK)


class SaveDeviceIdApiViewSet(viewsets.ViewSet):
    
    # @check_authentication()
    @handle_exceptions
    def create(self, request):
            user_id = request.data.get('user_id')
            device_id = request.data.get('device_id')

            if not user_id or not device_id:
                return Response(
                    {
                        "success": False,
                        "user_not_logged_in": False,
                        "error": "Please provide User ID"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_data_obj = User.objects.get(user_id=user_id)
            if user_data_obj is None:
                return Response(
                    {
                        "success": False,
                        "user_not_logged_in": False,
                        "error": f"User with id - {user_id} not found"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_data_obj.device_id = device_id
            user_data_obj.save()

            return Response(
                    {
                        "success": True,
                        "user_not_logged_in": False,
                        "error": None
                    },
                    status=status.HTTP_200_OK
                )


class LogoutApiViewSet(viewsets.ViewSet):

    @check_authentication()
    @handle_exceptions
    def list(self, request):
        logout(request)
        return redirect("home-list")
        # return Response({
        #     "success": True,
        #     "user_not_logged_in": False,
        #     "user_unauthorized": False,
        #     "data": {"message": "Logged out successfully"},
        #     "error": None
        # }, status=status.HTTP_200_OK)


class ChangePasswordViewSet(viewsets.ViewSet):

    @check_authentication(required_role=['admin', 'hod'])
    @handle_exceptions
    def create(self, request):
        user_id = request.data.get("user_id")
        new_password = request.data.get("new_password")

        if not user_id or not new_password:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "user_id and new_password are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(user_id=user_id, is_active=True).first()
        if not user:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "User not found."
            }, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": {"user_id": user_id, "password_changed": True},
            "error": None
        }, status=status.HTTP_200_OK)

class UserDetailViewSet(viewsets.ViewSet):
    
    @handle_exceptions
    @check_authentication()
    def list(self, request):
        user = request.user        
        
        user_data_obj = get_object_or_404(User, user_id=user.user_id)
        data = UserSerializer(user_data_obj).data

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": data,
            "error": None
        }, status=status.HTTP_200_OK)

def login_to_account(request):
    try:
        request_user = request.user
        user_id = request.GET.get('user_id')
        user = User.objects.get(id=user_id)
        # user = User.objects.get(user_id=user_id)

        if request_user.is_staff:
            login(request, user)

        return redirect('dashboard-list')

    except Exception as e:
        print(e)
        return redirect('dashboard-list')

