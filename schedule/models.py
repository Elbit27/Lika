from django.db import models
from django.contrib.auth.models import User



class Item(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="items")


    def __str__(self):
        return self.name

    def poma_count(self):
        """Возвращает сумму amount всех связанных Poma"""
        return self.pomas.aggregate(total=models.Sum('amount'))['total'] or 0


class Poma(models.Model):
    class Days(models.TextChoices):
        MONDAY = 'Monday', 'Monday'
        TUESDAY = 'Tuesday', 'Tuesday'
        WEDNESDAY = 'Wednesday', 'Wednesday'
        THURSDAY = 'Thursday', 'Thursday'
        FRIDAY = 'Friday', 'Friday'
        SATURDAY = 'Saturday', 'Saturday'
        SUNDAY = 'Sunday', 'Sunday'

    day = models.CharField(max_length=10, choices=Days.choices)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='pomas')
    amount = models.IntegerField(max_length=2)

    def __str__(self):
        return f"{self.day} - {self.item.name}"
