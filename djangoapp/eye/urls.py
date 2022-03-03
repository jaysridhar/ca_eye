from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from eye import views
from eye import auth

urlpatterns = [
    path('', views.index),
    path('auth/login/', auth.login_user),
    path('auth/logout/', auth.logout_user),
    path('auth/token/', auth.get_auth_token),
    path('event', csrf_exempt(views.EventView.as_view())),
]
