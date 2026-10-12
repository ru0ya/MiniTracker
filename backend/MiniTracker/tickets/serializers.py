from rest_framework import serializers

from tickets.model import Ticket


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [  
                  "id",
                  "title",
                  "description",
                  "status",
                  "priority",
                  "created_at"
                  ]
