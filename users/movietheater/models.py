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
    video_file = models.FileField(upload_to='movies/')
    thumbnail = models.ImageField(upload_to='anime_thumbnails/', blank=True)

    def __str__(self):
        return self.title

