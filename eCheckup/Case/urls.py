from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'case-api', CaseViewSet, basename='case-api')
router.register(r'create-case-excel-api', CreateCaseFromExcelViewSet, basename='create-case-excel-api')
router.register(r'assign-api', CaseAssignmentViewSet, basename='assign-api')
router.register(r'schedule-api', ScheduleViewSet, basename='schedule-api')
router.register(r'case-log-api', CaseLogViewSet, basename='case-log-api')
router.register(r'staff-list-api', StaffListViewSet, basename='staff-list-api')
router.register(r'upload-document-api', UploadDocumentViewSet, basename='upload-document-api')
router.register(r'case-issue-api', CaseIssueViewSet, basename='case-issue-api')
router.register(r'diagnostic-center-api', DiagnosticCenterViewSet, basename='diagnostic-center-api')
router.register(r'report-download-api', ReportDownloadViewSet, basename='report-download-api')

router.register(r'get-test-details-api', GetTestDetailsViewSet, basename='get-test-details-api')
router.register(r'telecaller-remark-api', TelecallerRemarkViewSet, basename='telecaller-remark-api')

router.register(r'report-summary-api', ReportSummaryViewSet, basename='report-summary-api')
router.register(r'finance-lic-api', FinanceLICViewSet, basename='finance-lic-api')
router.register(r'finance-dc-api', FinanceDCViewSet, basename='finance-dc-api')

router.register(r'insurance-company-api', InsuranceCompanyViewSet, basename='insurance-company-api')
router.register(r'tata-aig-office-api', TataAIGOfficeViewSet, basename='tata-aig-office-api')
router.register(r'finance-insurance-api', FinanceInsuranceViewSet, basename='finance-insurance-api')

urlpatterns = [
    path('', include(router.urls)),
    # path('add-test', AddTests, name='add-test')
]
