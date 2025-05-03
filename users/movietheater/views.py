from pathlib import Path
from django.conf import settings
from django.http import FileResponse, HttpResponse, HttpResponseNotFound
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Movie
import os
import urllib.parse
from wsgiref.util import FileWrapper

class MovieView(APIView):
    def get(self, request):
        movies = Movie.objects.all()
        data = []
        for movie in movies:
            try:
                # Принудительно проверяем доступность файла
                if not os.path.exists(movie.video_file.path):
                    print(f"Missing file: {movie.video_file.path}")
                    continue
                    
                data.append({
                    "id": movie.id,
                    "title": movie.title,
                    "description": movie.description,
                    "video_url": request.build_absolute_uri(movie.video_file.url),
                    "thumbnail": request.build_absolute_uri(movie.thumbnail.url) if movie.thumbnail else None,
                })
            except Exception as e:
                print(f"Error with movie {movie.id}: {str(e)}")
        return Response(data)
    
from django.http import FileResponse, HttpResponse, HttpResponseNotFound
from pathlib import Path

def stream_video(request, path):
    try:
        decoded_path = urllib.parse.unquote(path)
        file_path = Path(settings.MEDIA_ROOT) / 'movies' / decoded_path
        file_path = file_path.resolve()

        # Проверка на доступ за пределы MEDIA_ROOT
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
