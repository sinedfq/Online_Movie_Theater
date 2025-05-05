from rest_framework import serializers
from .models import Episode, EpisodeScreenshot, Movie, MovieScreenshot, Series, SeriesScreenshot


class ScreenshotSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

    class Meta:
        abstract = True
        fields = ['id', 'image_url', 'caption', 'created_at']

class MovieScreenshotSerializer(ScreenshotSerializer):
    class Meta(ScreenshotSerializer.Meta):
        model = MovieScreenshot

class SeriesScreenshotSerializer(ScreenshotSerializer):
    class Meta(ScreenshotSerializer.Meta):
        model = SeriesScreenshot

class EpisodeScreenshotSerializer(ScreenshotSerializer):
    class Meta(ScreenshotSerializer.Meta):
        model = EpisodeScreenshot

class MovieSerializer(serializers.ModelSerializer):
    video_360p_url = serializers.SerializerMethodField()
    video_720p_url = serializers.SerializerMethodField()
    video_1080p_url = serializers.SerializerMethodField()
    screenshots = MovieScreenshotSerializer(many=True, read_only=True)

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
                  'video_360p_url', 'video_720p_url', 'video_1080p_url', 'typeOF', 'screenshots']
        
class VideoSerializer(serializers.ModelSerializer):
    video_360p_url = serializers.SerializerMethodField()
    video_720p_url = serializers.SerializerMethodField()
    video_1080p_url = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    screenshots = SeriesScreenshotSerializer(many=True, read_only=True)

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
    
    def get_author(self, obj):
        # Просто возвращаем строковое значение author
        return obj.author

    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'thumbnail',
                  'video_360p_url', 'video_720p_url', 'video_1080p_url', 'typeOF', 'author', 'screenshots']
        

class EpisodeSerializer(serializers.ModelSerializer):
    video_360p_url = serializers.SerializerMethodField()
    video_720p_url = serializers.SerializerMethodField()
    video_1080p_url = serializers.SerializerMethodField()
    screenshots = EpisodeScreenshotSerializer(many=True, read_only=True)

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
        model = Episode
        fields = ['id', 'title', 'description', 'episode_number',
                 'video_360p_url', 'video_720p_url', 'video_1080p_url', 'screenshots']

class SeriesSerializer(serializers.ModelSerializer):
    episodes = EpisodeSerializer(many=True, read_only=True)
    screenshots = SeriesScreenshotSerializer(many=True, read_only=True)
    
    class Meta:
        model = Series
        fields = ['id', 'title', 'description', 'thumbnail', 'typeOF', 'episodes', 'screenshots']

