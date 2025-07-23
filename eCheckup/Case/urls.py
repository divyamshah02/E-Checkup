from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'case-api', CaseViewSet, basename='case-api')
router.register(r'assign-api', CaseAssignmentViewSet, basename='assign-api')
router.register(r'schedule-api', ScheduleViewSet, basename='schedule-api')
router.register(r'case-log-api', CaseLogViewSet, basename='case-log-api')
router.register(r'staff-list-api', StaffListViewSet, basename='staff-list-api')
router.register(r'upload-document-api', UploadDocumentViewSet, basename='upload-document-api')
router.register(r'diagnostic-center-api', DiagnosticCenterViewSet, basename='diagnostic-center-api')
router.register(r'report-download-api', ReportDownloadViewSet, basename='report-download-api')

urlpatterns = [
    path('', include(router.urls)),
]
