from django.contrib import admin
from .models import CustomUser, Episode, Movie, Series, Video
from .models import MovieScreenshot, SeriesScreenshot, EpisodeScreenshot

# Inline для скриншотов
class MovieScreenshotInline(admin.TabularInline):
    model = MovieScreenshot
    extra = 1

class SeriesScreenshotInline(admin.TabularInline):
    model = SeriesScreenshot
    extra = 1

class EpisodeScreenshotInline(admin.TabularInline):
    model = EpisodeScreenshot
    extra = 1

# Админки с инлайнами
@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'typeOF')
    inlines = [MovieScreenshotInline]

@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ('title', 'typeOF')
    inlines = [SeriesScreenshotInline]

@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ('series', 'episode_number', 'title')
    list_filter = ('series',)
    inlines = [EpisodeScreenshotInline]

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'typeOF')

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('avatar',)