from pathlib import Path
from django.conf import settings
from django.http import FileResponse, HttpResponse, HttpResponseNotFound
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from wsgiref.util import FileWrapper
import urllib.parse
import os
from .serializer import EpisodeScreenshotSerializer, MovieScreenshotSerializer, MovieSerializer, SeriesScreenshotSerializer, SeriesSerializer, EpisodeSerializer, VideoSerializer
from .models import Movie, Series, Episode, Video

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
            except Movie.DoesNotExist:
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