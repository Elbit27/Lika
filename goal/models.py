from django.db import models

class Goal(models.Model):
    COLOR_CHOICES = [
        ('white', 'White'),
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('amber', 'Amber'),
        ('purple', 'Purple'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    card_color = models.CharField(max_length=20, choices=COLOR_CHOICES, default='white')
    prize = models.CharField(max_length=100, null=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def uncompleted_steps(self):
        return [step for step in self.steps.all() if not step.completed]

    @property
    def completed_steps(self):
        return [step for step in self.steps.all() if step.completed]

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = 'Goals'
        ordering = ('created_at',)


class Step(models.Model):
    goal = models.ForeignKey('Goal', on_delete=models.CASCADE, related_name='steps')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.goal.title})"

    class Meta:
        verbose_name_plural = 'Steps'
        ordering = ('created_at',)
