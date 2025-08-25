from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()

router.register(r'', HomeViewSet, basename='home')
router.register(r'login', LoginViewSet, basename='login')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'case-detail', CaseDetailViewSet, basename='case-detail')
router.register(r'create-case', CreateCaseViewset, basename='create-case')
router.register(r'user-management', UserManagementViewSet, basename='user-management')
router.register(r'lic-management', LICManagementViewSet, basename='lic-management')

urlpatterns = [
    path('', include(router.urls)),
]
