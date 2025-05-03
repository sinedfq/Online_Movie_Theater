from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # Добавляем дополнительные поля
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.username

class Movie(models.Model):
    title = models.CharField(max_length=50)
    description = models.TextField()
    video_url = models.URLField(max_length=500)

    def __str__(self):
        return self.title