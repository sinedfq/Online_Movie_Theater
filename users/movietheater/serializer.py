from rest_framework import serializers
from .models import Movie

class MovieSerializer(serializers.ModelSerializer):
    video_360p_url = serializers.SerializerMethodField()
    video_720p_url = serializers.SerializerMethodField()
    video_1080p_url = serializers.SerializerMethodField()

    def get_video_360p_url(self, obj):
        if obj.video_360p:
            return self.context['request'].build_absolute_uri(obj.video_360p.url)
        return None

    def get_video_720p_url(self, obj):
        if obj.video_720p:
            return self.context['request'].build_absolute_uri(obj.video_720p.url)
        return None

    def get_video_1080p_url(self, obj):
        if obj.video_1080p:
            return self.context['request'].build_absolute_uri(obj.video_1080p.url)
        return None

    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'thumbnail',
                  'video_360p_url', 'video_720p_url', 'video_1080p_url']