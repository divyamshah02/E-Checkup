from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    path('user-api/', include('UserDetail.urls')),
    path('lic-api/', include('LIC.urls')),
]
