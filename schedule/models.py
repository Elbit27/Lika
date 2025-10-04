from django.db import models


class Item(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def poma_count(self):
        """Возвращает количество связанных Poma"""
        return self.pomas.count()


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

    def __str__(self):
        return f"{self.day} - {self.item.name}"
