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

    def update(self, instance, validated_data):
        steps_data = validated_data.pop('steps', [])

        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.card_color = validated_data.get('card_color', instance.card_color)
        instance.prize = validated_data.get('prize', instance.prize)
        instance.save()

        # 3. Перезаписываем шаги (твоя отличная рабочая логика)
        instance.steps.all().delete()

        for s_data in steps_data:
            Step.objects.create(
                goal=instance,
                title=s_data['title'],
                description=s_data.get('description', '')
            )

        return instance