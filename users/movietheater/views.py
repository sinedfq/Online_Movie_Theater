import urllib.parse
from pathlib import Path
from django.conf import settings
from django.contrib.auth.models import User
from django.http import FileResponse, HttpResponse, HttpResponseNotFound
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import CreateModelMixin, DestroyModelMixin, ListModelMixin
from rest_framework.permissions import IsAuthenticated
from .serializer import EpisodeScreenshotSerializer, MovieScreenshotSerializer, MovieSerializer, SeriesScreenshotSerializer, SeriesSerializer, EpisodeSerializer, UserContentStatusSerializer, VideoSerializer, RegisterSerializer
from .models import Movie, Series, Episode, UserContentStatus, Video
from .models import MovieRating, SeriesRating, VideoRating
from .serializer import MovieRatingSerializer, SeriesRatingSerializer, VideoRatingSerializer


class MovieDetailView(APIView):
    def get(self, request, pk):
        try:
            movie = Movie.objects.get(pk=pk)
            serializer = MovieSerializer(movie, context={'request': request})
            return Response(serializer.data)
        except Movie.DoesNotExist:
            return Response(status=404)

class MovieView(APIView):
    def get(self, request, pk=None):
        if pk is not None:
            try:
                movie = Movie.objects.get(pk=pk)
                serializer = MovieSerializer(movie, context={'request': request})
                return Response(serializer.data)
            except Video.DoesNotExist:
                return Response(status=404)
        
        movies = Movie.objects.all()
        data = []
        for movie in movies:
            try:
                serializer = MovieSerializer(movie, context={'request': request})
                data.append(serializer.data)
            except Exception as e:
                print(f"Error with movie {movie.id}: {str(e)}")
        return Response(data)

class SeriesView(APIView):
    def get(self, request, pk=None):
        if pk is not None:
            try:
                series = Series.objects.get(pk=pk)
                serializer = SeriesSerializer(series, context={'request': request})
                return Response(serializer.data)
            except Series.DoesNotExist:
                return Response(status=404)
        
        series = Series.objects.all()
        data = []
        for s in series:
            try:
                serializer = SeriesSerializer(s, context={'request': request})
                data.append(serializer.data)
            except Exception as e:
                print(f"Error with series {s.id}: {str(e)}")
        return Response(data)

class EpisodeView(APIView):
    def get(self, request, pk=None):
        if pk is not None:
            try:
                episode = Episode.objects.get(pk=pk)
                serializer = EpisodeSerializer(episode, context={'request': request})
                return Response(serializer.data)
            except Episode.DoesNotExist:
                return Response(status=404)
        
        episodes = Episode.objects.all()
        data = []
        for episode in episodes:
            try:
                serializer = EpisodeSerializer(episode, context={'request': request})
                data.append(serializer.data)
            except Exception as e:
                print(f"Error with episode {episode.id}: {str(e)}")
        return Response(data)

def stream_video(request, path, content_type='movies'):
    try:
        decoded_path = urllib.parse.unquote(path)
        file_path = Path(settings.MEDIA_ROOT) / content_type / decoded_path
        file_path = file_path.resolve()

        if not str(file_path).startswith(str(Path(settings.MEDIA_ROOT).resolve())):
            return HttpResponse("Access denied", status=403)

        if not file_path.exists():
            print(f"File not found: {file_path}")
            return HttpResponseNotFound("File not found")

        file_size = file_path.stat().st_size
        range_header = request.headers.get('Range')

        if range_header:
            start, end = 0, file_size - 1
            range_type, ranges = range_header.split('=')
            if range_type == 'bytes':
                range_parts = ranges.split('-')
                start = int(range_parts[0]) if range_parts[0] else 0
                end = int(range_parts[1]) if range_parts[1] else file_size - 1

            length = end - start + 1
            file = open(file_path, 'rb')
            file.seek(start)

            response = FileResponse(file, status=206, content_type='video/mp4')
            response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
            response['Content-Length'] = str(length)
        else:
            response = FileResponse(open(file_path, 'rb'), content_type='video/mp4')
            response['Content-Length'] = str(file_size)

        response['Accept-Ranges'] = 'bytes'
        return response

    except Exception as e:
        print(f"Streaming error: {str(e)}")
        return HttpResponse(f"Server error: {str(e)}", status=500)

def stream_movie_video(request, path):
    return stream_video(request, path, content_type='movies')

def stream_series_video(request, path):
    return stream_video(request, path, content_type='series')

class ContentListView(APIView):
    def get(self, request):
        movies = Movie.objects.all()
        series = Series.objects.all()
        videos = Video.objects.all()
        
        movie_serializer = MovieSerializer(movies, many=True, context={'request': request})
        series_serializer = SeriesSerializer(series, many=True, context={'request': request})
        video_serializer = VideoSerializer(videos, many=True, context={'request': request})
        
        data = {
            'movies': movie_serializer.data,
            'series': series_serializer.data,
            'videos': video_serializer.data 
        }
        return Response(data)

class SeriesDetailView(APIView):
    def get(self, request, pk):
        try:
            series = Series.objects.prefetch_related('episodes').get(pk=pk)
            serializer = SeriesSerializer(series, context={'request': request})
            return Response(serializer.data)
        except Series.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
class VideoDetailView(APIView):
    def get(self, request, pk):
        try:
            video = Video.objects.get(pk=pk)
            serializer = VideoSerializer(video, context={'request': request})
            return Response(serializer.data)
        except Movie.DoesNotExist:
            return Response(status=404)

class VideoView(APIView):
    def get(self, request, pk=None):
        if pk is not None:
            try:
                video = Video.objects.get(pk=pk)
                serializer = VideoSerializer(video, context={'request': request})
                return Response(serializer.data)
            except Movie.DoesNotExist:
                return Response(status=404)
        
        videos = video.objects.all()
        data = []
        for video in videos:
            try:
                serializer = VideoSerializer(video, context={'request': request})
                data.append(serializer.data)
            except Exception as e:
                print(f"Error with movie {video.id}: {str(e)}")
        return Response(data)
    
class ScreenshotMixin:
    parser_classes = [MultiPartParser, FormParser]
    
    def get_object(self, model_class, pk):
        try:
            return model_class.objects.get(pk=pk)
        except model_class.DoesNotExist:
            return None

class MovieScreenshotView(APIView, ScreenshotMixin):
    def post(self, request, movie_id):
        movie = self.get_object(Movie, movie_id)
        if not movie:
            return Response({'error': 'Movie not found'}, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data.copy()
        data['movie'] = movie.id
        serializer = MovieScreenshotSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SeriesScreenshotView(APIView, ScreenshotMixin):
    def post(self, request, series_id):
        series = self.get_object(Series, series_id)
        if not series:
            return Response({'error': 'Series not found'}, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data.copy()
        data['series'] = series.id
        serializer = SeriesScreenshotSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EpisodeScreenshotView(APIView, ScreenshotMixin):
    def post(self, request, episode_id):
        episode = self.get_object(Episode, episode_id)
        if not episode:
            return Response({'error': 'Episode not found'}, status=status.HTTP_404_NOT_FOUND)
        
        data = request.data.copy()
        data['episode'] = episode.id
        serializer = EpisodeScreenshotSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from movietheater.models import CustomUser  # Импортируйте вашу кастомную модель
from rest_framework_simplejwt.views import TokenObtainPairView

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()  # Используйте вашу кастомную модель
    serializer_class = RegisterSerializer

class LoginView(TokenObtainPairView):
    pass


from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    data = {
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'avatar': user.avatar.url if user.avatar else None,  # Добавлено поле avatar
        # Добавьте другие поля по необходимости
    }
    return Response(data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_avatar(request):
    if 'avatar' not in request.FILES:
        return Response(
            {'error': 'No avatar file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    request.user.avatar = request.FILES['avatar']
    request.user.save()
    
    return Response({
        'avatar_url': request.build_absolute_uri(request.user.avatar.url)
    })


class RatingMixin:
    permission_classes = [IsAuthenticated]
    
    def get_content_object(self, model_class, pk):
        try:
            return model_class.objects.get(pk=pk)
        except model_class.DoesNotExist:
            return None

class MovieRatingView(APIView, RatingMixin):
    def post(self, request, movie_id):
        movie = self.get_content_object(Movie, movie_id)
        if not movie:
            return Response({'error': 'Movie not found'}, status=status.HTTP_404_NOT_FOUND)
        
        value = request.data.get('value')
        if not value or not (1 <= int(value) <= 5):
            return Response(
                {'error': 'Rating value must be between 1 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rating, created = MovieRating.objects.update_or_create(
            user=request.user,
            movie=movie,
            defaults={'value': value}
        )
        
        serializer = MovieRatingSerializer(rating, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class SeriesRatingView(APIView, RatingMixin):
    def post(self, request, series_id):
        series = self.get_content_object(Series, series_id)
        if not series:
            return Response({'error': 'Series not found'}, status=status.HTTP_404_NOT_FOUND)
        
        value = request.data.get('value')
        if not value or not (1 <= int(value) <= 5):
            return Response(
                {'error': 'Rating value must be between 1 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rating, created = SeriesRating.objects.update_or_create(
            user=request.user,
            series=series,
            defaults={'value': value}
        )
        
        serializer = SeriesRatingSerializer(rating, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class VideoRatingView(APIView, RatingMixin):
    def post(self, request, video_id):
        video = self.get_content_object(Video, video_id)
        if not video:
            return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)
        
        value = request.data.get('value')
        if not value or not (1 <= int(value) <= 5):
            return Response(
                {'error': 'Rating value must be between 1 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rating, created = VideoRating.objects.update_or_create(
            user=request.user,
            video=video,
            defaults={'value': value}
        )
        
        serializer = VideoRatingSerializer(rating, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
class UserContentStatusViewSet(GenericViewSet, CreateModelMixin, DestroyModelMixin, ListModelMixin):
    queryset = UserContentStatus.objects.all()
    serializer_class = UserContentStatusSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset().filter(user=self.request.user)
        
        # Добавляем фильтрацию по параметрам запроса
        content_type = self.request.query_params.get('content_type')
        content_id = self.request.query_params.get('content_id')
        
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        if content_id:
            queryset = queryset.filter(content_id=content_id)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['GET'])
    def favorites(self, request):
        favorites = self.get_queryset().filter(status='favorite')
        serializer = self.get_serializer(favorites, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'])
    def watched(self, request):
        watched = self.get_queryset().filter(status='watched')
        serializer = self.get_serializer(watched, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'])
    def watchlist(self, request):
        watchlist = self.get_queryset().filter(status='watchlist')
        serializer = self.get_serializer(watchlist, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['POST'])
    def toggle_status(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        content_type = serializer.validated_data['content_type']
        content_id = serializer.validated_data['content_id']
        content_status = serializer.validated_data['status']
        
        # Проверяем существование контента
        model_map = {
            'movie': Movie,
            'series': Series,
            'video': Video
        }
        
        if content_type not in model_map:
            return Response(
                {'error': 'Invalid content type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            model_map[content_type].objects.get(pk=content_id)
        except ObjectDoesNotExist:
            return Response(
                {'error': 'Content not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Проверяем существование статуса
        instance = self.get_queryset().filter(
            content_type=content_type,
            content_id=content_id,
            status=content_status
        ).first()
        
        if instance:
            instance.delete()
            return Response({'status': 'removed'}, status=status.HTTP_200_OK)
        else:
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    