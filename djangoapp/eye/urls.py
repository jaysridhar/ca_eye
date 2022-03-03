from django.urls import path
from eye import views

urlpatterns = [
    path('', views.index),
    path('event', views.manage_event),
]
