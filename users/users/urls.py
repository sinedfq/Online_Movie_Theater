from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.cache import cache_control
from movietheater.views import (
    ContentListView,
    MovieView, MovieDetailView,
    SeriesView, SeriesDetailView,
    EpisodeView,
    stream_movie_video,
    stream_series_video
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Общий контент
    path('api/content/', ContentListView.as_view(), name='content-list'),

    # Фильмы
    path('api/movies/', MovieView.as_view(), name='movies-list'),
    path('api/movies/<int:pk>/', MovieDetailView.as_view(), name='movie-detail'),

    # Сериалы
    path('api/series/', SeriesView.as_view(), name='series-list'),
    path('api/series/<int:pk>/', SeriesDetailView.as_view(), name='series-detail'),

    # Эпизоды
    path('api/episodes/', EpisodeView.as_view(), name='episodes-list'),
    path('api/episodes/<int:pk>/', EpisodeView.as_view(), name='episode-detail'),

    # Потоковое видео
    path('media/movies/<path:path>', 
         cache_control(no_cache=True)(stream_movie_video), 
         name='stream-movie-video'),
    path('media/series/<path:path>', 
         cache_control(no_cache=True)(stream_series_video), 
         name='stream-series-video'),
]

# Подключение медиафайлов
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
