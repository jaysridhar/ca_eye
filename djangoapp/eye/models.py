from django.db import models

class Event(models.Model):
    session_id = models.CharField(max_length=150)
    category = models.CharField(max_length=100) # Category of the event
    name = models.CharField(max_length=50)      # Name of the event
    data = models.TextField()   # not using JSONField here to be able
                                # to catch invalid values (ie not json)
    error_mesg = models.TextField(null=True) # Storing error messages here, if any 
    timestamp = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'event'
