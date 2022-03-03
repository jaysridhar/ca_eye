import json
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from eye.tasks import save_event

def index(request):
    return render(request, 'base_home.html', {'user': request.user})

class EventView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not request.user.is_authenticated: return HttpResponse('not trusted')
        if len(request.body.strip()) == 0:
            return HttpResponseBadRequest('no body content - must include JSON of event')
        event_data = json.loads(request.body)
        print(f'event_data = {event_data}')
        save_event.apply_async((event_data,), countdown=2)
        print('dispatched to save_event()')
        return HttpResponse('ok')
