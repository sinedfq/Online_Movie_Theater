from django.db import models
from django.contrib.auth.models import AbstractUser


def user_avatar_path(instance, filename):
    return f'avatars/user_{instance.id}/{filename}'


class CustomUser(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(
        upload_to=user_avatar_path,
        blank=True,
        null=True,
        verbose_name='Аватар'
    )
    
    def __str__(self):
        return self.username

class Content(models.Model):
    """Базовый класс для всего контента"""
    CONTENT_TYPES = [
        ('movie', 'Фильм'),
        ('series', 'Сериал'),
        ('video', 'Видео'),
    ]
    
    title = models.CharField(max_length=150)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True)
    typeOF = models.CharField(max_length=10, choices=CONTENT_TYPES)
    poster = models.ImageField(upload_to='posters/', blank=True, null=True)
    
    class Meta:
        abstract = True

class Movie(Content):
    """Модель для фильмов"""
    video_360p = models.FileField(upload_to='movies/360p/', null=True, blank=True)
    video_720p = models.FileField(upload_to='movies/720p/', null=True, blank=True)
    video_1080p = models.FileField(upload_to='movies/1080p/', null=True, blank=True)
    
    def __str__(self):
        return self.title
    
class Video(Content):
    """Модель для видео"""
    author = models.CharField(null = True, blank= True)
    video_360p = models.FileField(upload_to='movies/360p/', null=True, blank=True)
    video_720p = models.FileField(upload_to='movies/720p/', null=True, blank=True)
    video_1080p = models.FileField(upload_to='movies/1080p/', null=True, blank=True)
    
    def __str__(self):
        return self.title

class Series(Content):
    """Модель для сериалов (без сезонов)"""
    def __str__(self):
        return self.title

class Episode(models.Model):
    """Модель для эпизодов сериала"""
    series = models.ForeignKey(Series, related_name='episodes', on_delete=models.CASCADE)
    episode_number = models.PositiveIntegerField()
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    video_360p = models.FileField(upload_to='series/360p/', null=True, blank=True)
    video_720p = models.FileField(upload_to='series/720p/', null=True, blank=True)
    video_1080p = models.FileField(upload_to='series/1080p/', null=True, blank=True)
    
    class Meta:
        ordering = ['episode_number']
        unique_together = ('series', 'episode_number')
    
    def __str__(self):
        return f"{self.series.title} - Эпизод {self.episode_number}: {self.title}"

class Screenshot(models.Model):
    """Базовая модель для скриншотов"""
    image = models.ImageField(upload_to='screenshots/')
    caption = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        abstract = True

class MovieScreenshot(Screenshot):
    movie = models.ForeignKey(Movie, related_name='screenshots', on_delete=models.CASCADE)

class SeriesScreenshot(Screenshot):
    series = models.ForeignKey(Series, related_name='screenshots', on_delete=models.CASCADE)

class EpisodeScreenshot(Screenshot):
    episode = models.ForeignKey(Episode, related_name='screenshots', on_delete=models.CASCADE)
