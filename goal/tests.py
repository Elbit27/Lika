from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from goal.models import Goal, Step

User = get_user_model()


class GoalCreationTestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="securepassword123"
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse("goal-list")

    def test_create_goal_with_steps_success(self):
        payload = {
            "title": "Выучить Django за 3 месяца",
            "description": "Изучить ORM, DRF и написать крутое приложение Specter",
            "card_color": "blue",
            "prize": "Купить новый игровой монитор",
            "steps": [
                {
                    "title": "Изучить модели и миграции",
                    "description": "Понять связи ForeignKey, ManyToMany и OneToOne",
                },
                {
                    "title": "Написать API на DRF",
                    "description": "Разобраться с сериализаторами и ViewSets",
                },
            ],
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Goal.objects.count(), 1)

        goal = Goal.objects.first()
        self.assertEqual(goal.title, payload["title"])
        self.assertEqual(goal.card_color, "blue")
        self.assertEqual(goal.created_by, self.user)
        self.assertEqual(goal.steps.count(), 2)

        response_data = response.json()
        self.assertEqual(response_data["title"], payload["title"])
        self.assertIn("id", response_data)
        self.assertEqual(len(response_data["steps"]), 2)

    def test_create_goal_without_steps_success(self):
        payload = {
            "title": "Простая цель без этапов",
            "description": "Сделать быстрое действие",
            "card_color": "white",
            "steps": [],
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Goal.objects.count(), 1)
        self.assertEqual(Step.objects.count(), 0)

    def test_create_goal_validation_error(self):
        payload = {
            "description": "Цель без названия",
            "card_color": "green",
        }

        response = self.client.post(self.url, data=payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.json())
