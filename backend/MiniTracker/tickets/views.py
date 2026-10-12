from django.db.models import Count
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response


from tickets.models import Ticket
from tickets.serializers import TicketSerializer, TicketStatsSerializer
from tickets.filters import TicketFilter


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filter_backends = [
            DjangoFilterBackend,
            filters.SearchFilter,
            filters.OrderingFilter
            ]
    filterset_class = TicketFilter
    search_fields = ['status', 'priority']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        stats = (
            queryset
                .values('status')
                .annotate(count=Count('id'))
                .order_by('status')
        )
        serializer = TicketStatsSerializer(stats, many=True)
        return Response(serializer.data)
