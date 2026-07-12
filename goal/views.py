from goal import serializers
from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets
from goal.models import Goal


def goal_list(request):
    goals = Goal.objects.all()
    return render(request, 'goal/goal_list.html', {'goals': goals})

def goal_create_page(request, pk=None):
    goal = None
    if pk:
        goal = get_object_or_404(Goal.objects.prefetch_related('questions__answers'), pk=pk)

    return render(request, 'goal/create_goal.html', {'goal': goal})


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_class(self):
        return serializers.GoalSerializer

