from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'user-api', UserCreationViewSet, basename='user-api')
router.register(r'user-detail-api', UserDetailViewSet, basename='user-detail-api')
router.register(r'login-api', LoginApiViewSet, basename='login-api')
router.register(r'logout-api', LogoutApiViewSet, basename='logout-api')
router.register(r'change-password-api', ChangePasswordViewSet, basename='change-password-api')

router.register(r'save-device-id-api', SaveDeviceIdApiViewSet, basename='save-device-id-api')


urlpatterns = [
    path('', include(router.urls)),
    path('custom-admin/login_to_account', login_to_account, name='login_to_account'),
]
