from rest_framework import viewsets, status
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Case, Schedule, CaseActionLog
from .serializers import CaseSerializer, ScheduleSerializer, CaseLogSerializer
from UserDetail.models import UserDetail
from UserDetail.serializers import UserDetailSerializer
from utils.decorators import check_authentication, handle_exceptions
import random, string

class CaseViewSet(viewsets.ViewSet):

    @check_authentication(required_role=['admin', 'hod', 'coordinator'])
    @handle_exceptions
    def create(self, request):
        data = request.data
        case_type = data.get("case_type")

        if not case_type:
            return Response({"error": "Missing case_type."}, status=400)

        prefix = {
            'vmer': 'VM',
            'dc_visit': 'DC',
            'online': 'ON'
        }.get(case_type, 'XX')

        while True:
            generated_id = prefix + ''.join(random.choices(string.digits, k=10))
            if not Case.objects.filter(case_id=generated_id).exists():
                break

        data['case_id'] = generated_id
        data['created_by'] = request.user.user_id
        data['status'] = 'created'

        serializer = CaseSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            CaseActionLog.objects.create(case_id=generated_id, action_by=request.user.user_id, action="Case Created")
            return Response({"success": True, "data": serializer.data}, status=201)
        return Response({"success": False, "error": serializer.errors}, status=400)

    @check_authentication()
    @handle_exceptions
    def list(self, request):
        user = request.user
        user_role = user.role

        case_id = request.query_params.get('case_id')
        case_type = request.query_params.get('type')

        if case_id:
            case = Case.objects.filter(case_id=case_id, is_active=True).first()
            if not case:
                return Response({"error": "Case not found."}, status=404)
            serializer = CaseSerializer(case)
            return Response({"success": True, "data": serializer.data})

        elif case_type and user_role == 'admin':
            cases = Case.objects.filter(case_type=case_type, is_active=True)
        else:
            if user_role == 'hod':
                cases = Case.objects.filter(is_active=True)
            elif user_role == 'coordinator':
                cases = Case.objects.filter(assigned_coordinator_id=user.user_id, is_active=True)
            elif user_role == 'telecaller':
                cases = Case.objects.filter(assigned_telecaller_id=user.user_id, status='assigned', is_active=True)
            elif user_role == 'vmer_med_co':
                cases = Case.objects.filter(assigned_vmer_med_co_id=user.user_id, status='scheduled', is_active=True)
            elif user_role == 'diagnostic_center':
                cases = Case.objects.filter(assigned_dc_id=user.user_id, status='scheduled', is_active=True)
            elif user_role == 'lic':
                cases = Case.objects.filter(status='completed', is_active=True)
            else:
                return Response({"error": "Unauthorized role"}, status=403)

        serializer = CaseSerializer(cases, many=True)
        return Response({"success": True, "data": serializer.data})

    @check_authentication(required_role=['admin', 'hod', 'coordinator', 'telecaller', 'vmer_med_co', 'diagnostic_center'])
    @handle_exceptions
    def update(self, request, pk=None):
        case_id = request.data.get("case_id")
        case = Case.objects.filter(case_id=case_id, is_active=True).first()
        if not case:
            return Response({"error": "Invalid case_id."}, status=404)

        serializer = CaseSerializer(case, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            CaseActionLog.objects.create(case_id=case.case_id, action_by=request.user.user_id, action="Case Updated")
            return Response({"success": True, "data": serializer.data})
        return Response({"error": serializer.errors}, status=400)

    @check_authentication(required_role=['admin', 'hod'])
    @handle_exceptions
    def destroy(self, request, pk=None):
        case_id = request.data.get("case_id")
        case = Case.objects.filter(case_id=case_id).first()
        if not case:
            return Response({"error": "Case not found."}, status=404)
        case.is_active = False
        case.save()
        CaseActionLog.objects.create(case_id=case.case_id, action_by=request.user.user_id, action="Case Deleted")
        return Response({"success": True, "message": "Case soft-deleted."})


class CaseAssignmentViewSet(viewsets.ViewSet):

    @check_authentication(required_role=['coordinator'])
    @handle_exceptions
    def create(self, request):
        case_id = request.data.get("case_id")
        assign_to = request.data.get("assign_to")
        role = request.data.get("role")

        case = Case.objects.filter(case_id=case_id, is_active=True).first()
        if not case:
            return Response({"error": "Invalid case_id."}, status=404)

        if role == 'telecaller':
            case.assigned_telecaller_id = assign_to
            case.status = 'assigned'
            action = f"Assigned to Telecaller {assign_to}"
        elif role == 'vmer_med_co':
            case.assigned_vmer_med_co_id = assign_to
            action = f"Assigned to VMER Med Co {assign_to}"
        elif role == 'diagnostic_center':
            case.assigned_dc_id = assign_to
            action = f"Assigned to Diagnostic Center {assign_to}"
        else:
            return Response({"error": "Invalid role."}, status=400)

        case.save()
        CaseActionLog.objects.create(case_id=case.case_id, action_by=request.user.user_id, action=action)
        return Response({"success": True, "message": action})


class ScheduleViewSet(viewsets.ViewSet):

    @check_authentication(required_role=['telecaller'])
    @handle_exceptions
    def create(self, request):
        case_id = request.data.get("case_id")
        schedule_time = request.data.get("schedule_time")
        reason = request.data.get("reason", None)

        if not case_id or not schedule_time:
            return Response({"error": "Missing required fields."}, status=400)

        Schedule.objects.filter(case_id=case_id, is_active=True).update(is_active=False)

        schedule = Schedule.objects.create(
            case_id=case_id,
            schedule_time=schedule_time,
            reason=reason,
            created_by=request.user.user_id
        )

        Case.objects.filter(case_id=case_id).update(status='scheduled')

        CaseActionLog.objects.create(case_id=case_id, action_by=request.user.user_id, action="Schedule Created")
        return Response({"success": True, "data": ScheduleSerializer(schedule).data})


class CaseLogViewSet(viewsets.ViewSet):

    @check_authentication()
    @handle_exceptions
    def list(self, request):
        case_id = request.query_params.get("case_id")
        if not case_id:
            return Response({"error": "Missing case_id."}, status=400)

        logs = CaseActionLog.objects.filter(case_id=case_id).order_by('-timestamp')
        serializer = CaseLogSerializer(logs, many=True)
        return Response({"success": True, "data": serializer.data})


class StaffListViewSet(viewsets.ViewSet):

    @check_authentication(required_role=['admin', 'hod', 'coordinator'])
    @handle_exceptions
    def list(self, request):
        role = request.query_params.get('role')
        if not role:
            return Response({"error": "Missing role param."}, status=400)

        users = UserDetail.objects.filter(role=role, is_active=True)
        serializer = UserDetailSerializer(users, many=True)
        return Response({"success": True, "data": serializer.data})


class UploadDocumentViewSet(viewsets.ViewSet):

    @check_authentication(required_role='vmer_med_co')
    @handle_exceptions
    def create(self, request):
        case_id = request.data.get('case_id')
        video_url = request.data.get('video_url')

        if not case_id or not video_url:
            return Response({"error": "Missing case_id or video_url."}, status=400)

        case = Case.objects.filter(case_id=case_id, is_active=True).first()
        if not case:
            return Response({"error": "Invalid case_id."}, status=404)

        case.video_url = video_url
        case.status = 'submitted_to_lic'
        case.save()

        CaseActionLog.objects.create(
            case_id=case_id,
            action_by=request.user.user_id,
            action="Video recording uploaded by VMER Med Co"
        )

        return Response({"success": True, "message": "Video uploaded and submitted to LIC."}, status=200)

    @check_authentication(required_role='diagnostic_center')
    @handle_exceptions
    def update(self, request, pk=None):
        case_id = request.data.get('case_id')
        report_url = request.data.get('report_url')

        if not case_id or not report_url:
            return Response({"error": "Missing case_id or report_url."}, status=400)

        case = Case.objects.filter(case_id=case_id, is_active=True).first()
        if not case:
            return Response({"error": "Invalid case_id."}, status=404)

        case.report_url = report_url
        case.status = 'submitted_to_lic'
        case.save()

        CaseActionLog.objects.create(
            case_id=case_id,
            action_by=request.user.user_id,
            action="Diagnostic report uploaded by DC"
        )

        return Response({"success": True, "message": "Report uploaded and submitted to LIC."}, status=200)
