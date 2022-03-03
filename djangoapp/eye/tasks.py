#!/usr/bin/python

import json, datetime
from django.forms.models import model_to_dict
from celery import shared_task
from celery.utils.log import get_task_logger
from eye.models import Event

logger = get_task_logger(__name__)
debug = logger.debug
warning = logger.warning

@shared_task
def save_event(event_data):
    try:
        timestamp = datetime.datetime.strptime(event_data['timestamp'],'%Y-%m-%d %H:%M:%S.%f')
        error = 'future timestamp' if timestamp > datetime.datetime.now() else None
        event = Event(session_id = event_data['session_id'],
                      category = event_data['category'],
                      name = event_data['name'],
                      data = json.dumps(event_data['data']),
                      error_mesg = error,
                      timestamp = timestamp)
        event.save()
        return {'success': model_to_dict(event)}
    except Exception as ex:
        warning(f'save_event({event}) error: {str(ex)}', exc_info=ex)
        return {'error': str(ex)}
