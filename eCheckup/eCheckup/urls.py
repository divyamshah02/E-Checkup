from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('favicon.ico', RedirectView.as_view(url='/static/ericson_inverted_logo.png')),

    path('user-api/', include('UserDetail.urls')),
    path('lic-api/', include('LIC.urls')),
    path('case-api/', include('Case.urls')),
    path('', include('FrontEnd.urls')),
]
