from django.urls import path
from eye import views
from eye import auth

urlpatterns = [
    path('', views.index),
    path('auth/login/', auth.login_user),
    path('auth/logout/', auth.logout_user),
    path('event', views.manage_event),
]