from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.cache import cache_control
from movietheater.views import (
    ContentListView,
    EpisodeScreenshotView,
    LoginView,
    MovieScreenshotView,
    MovieView, MovieDetailView,
    RegisterView,
    SeriesScreenshotView,
    SeriesView, SeriesDetailView,
    EpisodeView,
    stream_movie_video,
    stream_series_video,
    update_avatar,
    user_profile
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
    path('movies/<int:movie_id>/screenshots/', MovieScreenshotView.as_view(), name='movie-screenshots'),
    path('series/<int:series_id>/screenshots/', SeriesScreenshotView.as_view(), name='series-screenshots'),
    path('episodes/<int:episode_id>/screenshots/', EpisodeScreenshotView.as_view(), name='episode-screenshots'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/profile/', user_profile, name='user-profile'),
    path('api/profile/update_avatar/', update_avatar, name='update-avatar'),
]

# Подключение медиафайлов
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
