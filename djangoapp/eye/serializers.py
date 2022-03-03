#!/usr/bin/python

from rest_framework import serializers
from eye.models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
