from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return render(request, 'base_home.html', {'user': request.user})

def manage_event(request):
    return HttpResponse('ok')