from rest_framework import serializers

from tickets.models import Ticket


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


class TicketStatsSerializer(serializers.Serializer):
    status = serializers.CharField()
    count = serializers.IntegerField()
