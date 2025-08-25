from rest_framework import viewsets, status
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import *
from .serializers import *
from UserDetail.models import User
from UserDetail.serializers import UserSerializer
from utils.decorators import check_authentication, handle_exceptions

import calendar
from datetime import datetime
from django.http import HttpResponse
from openpyxl import Workbook
from django.utils.timezone import make_aware
from utils.handle_s3_bucket import upload_file_to_s3

import random, string

class CaseViewSet(viewsets.ViewSet):

    @check_authentication(required_role=['admin', 'hod', 'coordinator'])
    # @handle_exceptions
    def create(self, request):
        data = request.data
        print(request.data.get('case_type'))
        # print(data)
        print(type(data))
        case_type = data.get("case_type")

        if not case_type:
            return Response({"error": "Missing case_type."}, status=400)

        prefix = {
            'vmer': 'VM',
            'dc_visit': 'DC',
            'online': 'ON',
            'both': 'BT'
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

        # Single Case View
        if case_id:
            case = Case.objects.filter(case_id=case_id, is_active=True).first()
            if not case:
                return Response({"error": "Case not found."}, status=404)
            serializer = CaseDetailSerializer(case)
            return Response({"success": True, "data": serializer.data})

        # Admin view by case_type
        if case_type and user_role == 'admin':
            cases = Case.objects.filter(case_type=case_type, is_active=True)
            serializer = CaseSerializer(cases, many=True)
            return Response({"success": True, "data": serializer.data})

        all_cases = Case.objects.none()
        pending_cases = Case.objects.none()
        completed_cases = Case.objects.none()

        if user_role == 'hod':
            all_cases = Case.objects.filter(is_active=True)
            pending_cases = all_cases.exclude(status__in=['completed'])
            completed_cases = all_cases.filter(status='completed')

        elif user_role == 'coordinator':
            all_cases = Case.objects.filter(assigned_coordinator_id=user.user_id, is_active=True)
            pending_cases = all_cases.exclude(status='submitted_to_lic')
            completed_cases = all_cases.filter(status='submitted_to_lic')

        elif user_role == 'telecaller':
            all_cases = Case.objects.filter(assigned_telecaller_id=user.user_id, is_active=True)
            pending_cases = all_cases.filter(status='assigned')
            completed_cases = all_cases.exclude(status='assigned')

        elif user_role == 'vmer_med_co':
            all_cases = Case.objects.filter(assigned_vmer_med_co_id=user.user_id, is_active=True)
            pending_cases = all_cases.filter(status='scheduled')
            completed_cases = all_cases.exclude(status='scheduled')

        elif user_role == 'diagnostic_center':
            all_cases = Case.objects.filter(assigned_dc_id=user.user_id, is_active=True)
            pending_cases = all_cases.filter(status='scheduled')
            completed_cases = all_cases.exclude(status='scheduled')

        elif user_role == 'lic':
            all_cases = Case.objects.filter(is_active=True)
            # Filter by cases where this LIC user is in that hierarchy — omitted logic, assumed handled elsewhere
            pending_cases = all_cases.filter(status='submitted_to_lic')
            completed_cases = all_cases.exclude(status='submitted_to_lic')

        else:
            return Response({"error": "Unauthorized role"}, status=403)

        return Response({
            "success": True,
            "data": {
                "all_cases": CaseSerializer(all_cases, many=True).data[::-1],
                "pending_cases": CaseSerializer(pending_cases, many=True).data,
                "completed_cases": CaseSerializer(completed_cases, many=True).data,
            }
        })

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
            if request.data.get('status') == 'submitted_to_lic':
                CaseActionLog.objects.create(case_id=case.case_id, action_by=request.user.user_id, action="Case Submitted to LIC")
            elif request.data.get('status') == 'issue':
                CaseActionLog.objects.create(case_id=case.case_id, action_by=request.user.user_id, action="Issue Raised")
            else:
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

    @check_authentication()
    @handle_exceptions
    def create(self, request):
        case_id = request.data.get("case_id")
        assign_to = request.data.get("assign_to")
        role = request.data.get("role")

        case = Case.objects.get(case_id=case_id, is_active=True)
        if not case:
            return Response({"error": "Invalid case_id."}, status=404)
        assign_to_obj = User.objects.filter(user_id=assign_to).first()
        if role == 'telecaller':
            case.assigned_telecaller_id = assign_to
            case.status = 'assigned'
            action = f"Assigned to Telecaller - {assign_to_obj.name}"
        elif role == 'vmer_med_co':
            case.assigned_vmer_med_co_id = assign_to
            action = f"Assigned to VMER Med Co - {assign_to_obj.name}"
        elif role == 'diagnostic_center':
            dc_details = DiagnosticCenter.objects.filter(user_id=assign_to).first()
            case.assigned_dc_id = assign_to
            action = f"Assigned to Diagnostic Center - {dc_details.name}"
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

        case_data = Case.objects.filter(case_id=case_id).first()
        if case_data.case_type == 'dc_visit':
            case_type = 'dc_visit'
        elif case_data.case_type == 'both':
            case_type = case_data.case_stage
        else:
            case_type = 'vmer'

        Schedule.objects.filter(case_id=case_id, is_active=True).update(is_active=False)
        already_scheduled = Schedule.objects.filter(case_id=case_id, schedule_type=case_type).exists()

        schedule = Schedule.objects.create(
            case_id=case_id,
            schedule_time=schedule_time,
            schedule_type=case_type,
            reason=reason,
            created_by=request.user.user_id
        )

        if already_scheduled:
            Case.objects.filter(case_id=case_id).update(status='rescheduled')
            CaseActionLog.objects.create(case_id=case_id, action_by=request.user.user_id, action="ReSchedule Created")

        else:
            Case.objects.filter(case_id=case_id).update(status='scheduled')
            CaseActionLog.objects.create(case_id=case_id, action_by=request.user.user_id, action="Schedule Created")    

        return Response({"success": True, "data": ScheduleSerializer(schedule).data})


class CaseIssueViewSet(viewsets.ViewSet):

    @check_authentication(required_role=['vmer_med_co', 'diagnostic_center'])
    @handle_exceptions
    def create(self, request):
        case_id = request.data.get('case_id')
        issue_type = request.data.get('issue_type')
        reason = request.data.get('reason')

        if not all([case_id, issue_type, reason]):
            return Response({"error": "Missing required fields."}, status=400)

        case_obj = Case.objects.filter(case_id=case_id, is_active=True).first()
        if not case_obj:
            return Response({"error": "Invalid case_id."}, status=404)

        case_obj.issue_type = issue_type
        case_obj.issue_reason = reason
        case_obj.status = 'issue'
        case_obj.save()

        # Log the action
        action_text = f"Issue reported: {str(issue_type).replace('_', ' ').title()}"
        CaseActionLog.objects.create(
            case_id=case_id,
            action_by=request.user.user_id,
            action=action_text,
            remarks=reason
        )

        return Response({
            "success": True, 
            "message": "Issue reported successfully. Case will be rescheduled by telecaller.",
            "data": CaseSerializer(case_obj).data
        }, status=201)


class CaseLogViewSet(viewsets.ViewSet):

    @check_authentication()
    @handle_exceptions
    def list(self, request):
        case_id = request.query_params.get("case_id")
        if not case_id:
            return Response({"error": "Missing case_id."}, status=400)

        logs = CaseActionLog.objects.filter(case_id=case_id).order_by('-timestamp')
        serializer = CaseActionLogSerializer(logs, many=True)
        return Response({"success": True, "data": serializer.data})


class StaffListViewSet(viewsets.ViewSet):

    @check_authentication()
    @handle_exceptions
    def list(self, request):
        role = request.query_params.get('role')
        if not role:
            return Response({"error": "Missing role param."}, status=400)

        users = User.objects.filter(role=role, is_active=True)
        serializer = UserSerializer(users, many=True)
        return Response({"success": True, "data": serializer.data})


class UploadDocumentViewSet_old(viewsets.ViewSet):

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
        case.status = 'uploaded'
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
        case.status = 'uploaded'
        case.save()

        CaseActionLog.objects.create(
            case_id=case_id,
            action_by=request.user.user_id,
            action="Diagnostic report uploaded by DC"
        )

        return Response({"success": True, "message": "Report uploaded and submitted to LIC."}, status=200)


class UploadDocumentViewSet(viewsets.ViewSet):

    @check_authentication(required_role=['vmer_med_co', 'diagnostic_center'])
    @handle_exceptions
    def create(self, request):
        case_id = request.data.get('case_id')
        uploaded_file = request.FILES.get('file')

        if not case_id or not uploaded_file:
            return Response({"error": "Missing case_id or file."}, status=400)

        case = Case.objects.get(case_id=case_id, is_active=True)
        if not case:
            return Response({"error": "Invalid case_id."}, status=404)

        try:
            # Upload file to S3
            file_url = upload_file_to_s3(uploaded_file)
            
            if request.user.role == 'vmer_med_co':
                case.video_url = file_url
                action = "Video recording uploaded by VMER Med Co"
            elif request.user.role == 'diagnostic_center':
                case.report_url = file_url
                action = "Diagnostic report uploaded by DC"
            
            case.status = 'uploaded'
            if str(case.case_type).lower() == "both":
                if case.case_stage == "vmer":
                    case.case_stage == "dc_visit"
                    case.status = 'assigned'
                    case.issue_reason = ''
                    case.issue_type = ''

            case.save()

            CaseActionLog.objects.create(
                case_id=case_id,
                action_by=request.user.user_id,
                action=action
            )

            return Response({"success": True, "message": "File uploaded successfully.", "file_url": file_url}, status=200)
            
        except Exception as e:
            return Response({"error": f"File upload failed: {str(e)}"}, status=500)


class DiagnosticCenterViewSet(viewsets.ViewSet):

    @check_authentication(required_role='admin')  # or 'hod' if needed
    @handle_exceptions
    def create(self, request):
        name = request.data.get("name")
        email = request.data.get("email")
        password = request.data.get("password")
        address = request.data.get("address")
        city = request.data.get("city")
        state = request.data.get("state")
        pincode = request.data.get("pincode")
        contact_person = request.data.get("contact_person")
        contact_number = request.data.get("contact_number")

        if not all([name, email, password, address, city, state, pincode]):
            return Response({
                "success": False,
                "data": None,
                "error": "Missing required fields."
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email, is_active=True).exists():
            return Response({
                "success": False,
                "data": None,
                "error": "A user with this email already exists."
            }, status=status.HTTP_400_BAD_REQUEST)

        user_id = self.generate_unique_user_id()

        # Create user
        user = User.objects.create_user(
            user_id=user_id,
            username=user_id,
            password=password,
            email=email,
            name=name,
            contact_number=contact_number,
            role="diagnostic_center"
        )

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

        return Response({
            "success": True,
            "data": {
                "user_id": user_id,
                "email": email,
                "diagnostic_center": DiagnosticCenterSerializer(dc).data
            },
            "error": None
        }, status=status.HTTP_201_CREATED)

    def generate_unique_user_id(self):
        prefix = "DC"
        while True:
            random_id = ''.join(random.choices(string.digits, k=10))
            user_id = prefix + random_id
            if not User.objects.filter(user_id=user_id).exists():
                return user_id


class ReportDownloadViewSet(viewsets.ViewSet):

    @check_authentication(required_role='admin')
    @handle_exceptions
    def list(self, request):
        return Response({"message": "Use POST methods to download invoices."})

    @check_authentication(required_role='admin')
    @handle_exceptions
    def create(self, request):
        report_type = request.data.get("report_type")
        print(report_type)
        if report_type == "dc_invoice":
            return self.generate_dc_invoice(request)
        elif report_type == "lic_invoice":
            return self.generate_lic_invoice(request)
        elif report_type == "coordinator_report":
            return self.generate_coordinator_report(request)
        else:
            return Response({"error": "Invalid report_type."}, status=400)

    def generate_dc_invoice(self, request):
        dc_user_id = request.data.get("dc_user_id")
        month = request.data.get("month")  # format: YYYY-MM

        year, month_num = map(int, month.split('-'))
        start_date = make_aware(datetime(year, month_num, 1))
        end_day = calendar.monthrange(year, month_num)[1]
        end_date = make_aware(datetime(year, month_num, end_day, 23, 59, 59))

        cases = Case.objects.filter(
            assigned_dc_id=dc_user_id,
            status='submitted_to_lic',
            created_at__range=(start_date, end_date)
        )

        wb = Workbook()
        ws = wb.active
        ws.title = "DC Invoice"
        ws.append(["Case ID", "Holder Name", "Phone", "Case Type", "Completed At", "Amount"])

        for case in cases:
            ws.append([
                case.case_id,
                case.holder_name,
                case.holder_phone,
                case.case_type,
                case.updated_at.strftime('%Y-%m-%d %H:%M'),
                "--"  # Amount can be fetched from a config if added later
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=dc_invoice_{month}.xlsx'
        wb.save(response)
        return response

    def generate_lic_invoice(self, request):
        lic_office_code = request.data.get("lic_office_code")
        month = request.data.get("month")

        year, month_num = map(int, month.split('-'))
        start_date = make_aware(datetime(year, month_num, 1))
        end_day = calendar.monthrange(year, month_num)[1]
        end_date = make_aware(datetime(year, month_num, end_day, 23, 59, 59))

        cases = Case.objects.filter(
            lic_office_code=lic_office_code,
            payment_method='lic',
            status='submitted_to_lic',
            created_at__range=(start_date, end_date)
        )

        wb = Workbook()
        ws = wb.active
        ws.title = "LIC Invoice"
        ws.append(["Case ID", "Holder Name", "Policy No", "Case Type", "Completed At", "Amount"])

        for case in cases:
            ws.append([
                case.case_id,
                case.holder_name,
                case.policy_number,
                case.case_type,
                case.updated_at.strftime('%Y-%m-%d %H:%M'),
                "--"
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=lic_invoice_{month}.xlsx'
        wb.save(response)
        return response

    def generate_coordinator_report(self, request):
        coordinator_id = request.data.get("coordinator_id")
        month = request.data.get("month")

        year, month_num = map(int, month.split('-'))
        start_date = make_aware(datetime(year, month_num, 1))
        end_day = calendar.monthrange(year, month_num)[1]
        end_date = make_aware(datetime(year, month_num, end_day, 23, 59, 59))

        cases = Case.objects.filter(
            assigned_coordinator_id=coordinator_id,
            created_at__range=(start_date, end_date)
        )

        wb = Workbook()
        ws = wb.active
        ws.title = "Coordinator Report"
        ws.append(["Case ID", "Holder Name", "Case Type", "Status", "Created At"])

        for case in cases:
            ws.append([
                case.case_id,
                case.holder_name,
                case.case_type,
                case.status,
                case.created_at.strftime('%Y-%m-%d %H:%M'),
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=coordinator_report_{month}.xlsx'
        wb.save(response)
        return response

