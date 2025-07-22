from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'user-api', UserCreationViewSet, basename='user-api')
router.register(r'login-api', LoginApiViewSet, basename='login-api')
router.register(r'logout-api', LogoutApiViewSet, basename='logout-api')
router.register(r'change-password-api', ChangePasswordViewSet, basename='change-password-api')

urlpatterns = [
    path('', include(router.urls)),
]
