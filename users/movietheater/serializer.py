from rest_framework import serializers
from .models import Movie

class MovieSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()
    
    def get_video_url(self, obj):
        return self.context['request'].build_absolute_uri(obj.video_file.url)
    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'video_url', 'thumbnail']
    