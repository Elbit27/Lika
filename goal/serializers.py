import json
from rest_framework import serializers
from .models import Goal, Step

class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        fields = '__all__'
        extra_kwargs = {'goal': {'read_only': True}}


class GoalSerializer(serializers.ModelSerializer):
    steps = StepSerializer(many=True)

    class Meta:
        model = Goal
        fields = ['id', 'title', 'description', 'card_color', 'prize', 'created_at', 'updated_at', 'steps']

    def create(self, validated_data):
        steps_data = validated_data.pop('steps', [])

        goal = Goal.objects.create(
            title=validated_data.get('title', 'Новая карточка'),
        )

        for index, step_data in enumerate(steps_data):
            step = Step.objects.create(
                goal=goal,
                title=step_data['title'],
                description=step_data['description'],
            )

        return goal