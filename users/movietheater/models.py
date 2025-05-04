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
    thumbnail = models.ImageField(upload_to='anime_thumbnails/', blank=True)
    video_360p = models.FileField(upload_to='movies/360p/', null=True, blank=True)
    video_720p = models.FileField(upload_to='movies/720p/', null=True, blank=True)
    video_1080p = models.FileField(upload_to='movies/1080p/', null=True, blank=True)

    def __str__(self):
        return self.title

