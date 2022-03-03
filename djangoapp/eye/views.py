import json, time
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse, QueryDict
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from eye.tasks import save_event
from eye.models import Event
from eye.serializers import EventSerializer

def index(request):
    return render(request, 'base_home.html', {'user': request.user})

class EventView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        def compose_query(value, *fields):
            q = None
            for name in fields:
                if q: q = q | Q(**{f'{name}__icontains': value})
                else: q = Q(**{f'{name}__icontains': value})
            return q
        start = time.perf_counter_ns()
        print(f'events(): {request.GET}')
        ser = EventSerializer
        error = request.GET['error'] if 'error' in request.GET else None
        if error:
            if error == 'show':
                # pick up events with errors
                qs = Event.objects.exclude(error_mesg__isnull=True)
            else:
                # pick up events without errors
                qs = Event.objects.filter(error_mesg__isnull=True)
        else:
            # pick up all events
            qs = Event.objects.all()
        if 'search' in request.GET and request.GET['search']:
            search = request.GET['search']
            qry = compose_query(search,
                                'session_id',
                                'category',
                                'name',
                                'data',
                                'timestamp')
            qs = qs.filter(qry)
        if 'sort' in request.GET and request.GET['sort'] and request.GET['sort'] != 'undefined':
            sortBy = request.GET['sort']
            direction = request.GET['order'] if 'order' in request.GET and request.GET['order'] else 'asc'
            direction = '' if direction == 'asc' else '-'
            sortCondition = f'{direction}{sortBy}'
            print(f'Sort Condition: "{sortCondition}"')
            qs = qs.order_by(sortCondition)
        if 'offset' in request.GET and 'limit' in request.GET:
            count = qs.count()
            offset = int(request.GET['offset'])
            limit = int(request.GET['limit'])
            qs = qs[offset:offset+limit]
            print(f'{error}, {offset}, {limit}: found {qs.count()} rows')
            resp = JsonResponse({
                'rows': ser(qs, many=True).data,
                'total': count
            }, safe=False)
        else:
            resp = JsonResponse(ser(qs,many=True).data,safe=False)
        end = time.perf_counter_ns()
        print(f'{error}: that took {(end-start)/1000000} ms')
        return resp

    def post(self, request):
        if not request.user.is_authenticated: return HttpResponse('not trusted')
        if len(request.body.strip()) == 0:
            return HttpResponseBadRequest('no body content - must include JSON of event')
        event_data = json.loads(request.body)
        save_event.apply_async((event_data,), countdown=2)
        return HttpResponse('ok')

    def delete(self, request):
        id_arr = json.loads(request.body)
        count = 0
        for eid in id_arr:
            event = Event.objects.get(pk=eid)
            event.delete()
            count += 1
        return HttpResponse(f'deleted {count} event(s)')
