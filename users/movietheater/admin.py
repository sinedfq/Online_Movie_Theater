from django.contrib import admin
from .models import Episode, Movie, Series, Video

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'typeOF')

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'typeOF')

@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ('title', 'typeOF')

@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ('series', 'episode_number', 'title')
    list_filter = ('series',)