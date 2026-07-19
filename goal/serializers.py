from rest_framework import serializers
from .models import Goal, Step

class StepSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)

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
            title=validated_data.get('title', 'Новая цель'),
            description=validated_data.get('description', ''),
            card_color=validated_data.get('card_color', 'white'),
            prize=validated_data.get('prize', '')
        )

        for step_data in steps_data:
            Step.objects.create(
                goal=goal,
                title=step_data.get('title'),
                description=step_data.get('description', ''),
                completed=step_data.get('completed', False)
            )

        return goal

    def update(self, instance, validated_data):
        steps_data = validated_data.pop('steps', [])

        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.card_color = validated_data.get('card_color', instance.card_color)
        instance.prize = validated_data.get('prize', instance.prize)
        instance.save()

        old_statuses = {step.id: step.completed for step in instance.steps.all()}

        instance.steps.all().delete()

        for s_data in steps_data:
            raw_id = s_data.get('id')
            step_id = int(raw_id) if raw_id is not None else None

            is_completed = s_data.get('completed', False)
            if isinstance(is_completed, str):
                is_completed = is_completed.lower() == 'true'

            if step_id in old_statuses and old_statuses[step_id] is True:
                is_completed = True

            Step.objects.create(
                goal=instance,
                title=s_data.get('title', 'Без названия'),
                description=s_data.get('description', ''),
                completed=is_completed
            )

        return instance