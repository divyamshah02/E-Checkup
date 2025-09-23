from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'head-office-api', HeadOfficeViewSet, basename='head-office-api')
router.register(r'regional-office-api', RegionalOfficeViewSet, basename='regional-office-api')
router.register(r'divisional-office-api', DivisionalOfficeViewSet, basename='divisional-office-api')
router.register(r'branch-office-api', BranchOfficeViewSet, basename='branch-office-api')
router.register(r'development-officer-api', DevelopmentOfficerViewSet, basename='development-officer-api')
router.register(r'agent-api', AgentViewSet, basename='agent-api')
router.register(r'lic-office-hierarchy-api', OfficeHierarchyViewSet, basename='lic-office-hierarchy-api')

urlpatterns = [
    path('', include(router.urls)),
]
