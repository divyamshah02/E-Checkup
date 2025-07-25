from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()

router.register(r'login', LoginViewSet, basename='login')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'case-detail', CaseDetailViewSet, basename='case-detail')


urlpatterns = [
    path('', include(router.urls)),
]
