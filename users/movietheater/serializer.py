from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from django.db import models
from .models import Episode, EpisodeScreenshot, Movie, MovieRating, MovieScreenshot, Series, SeriesRating, SeriesScreenshot, UserContentStatus, Video, VideoRating

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

class RatingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    
    class Meta:
        fields = ['user', 'value', 'created_at']

class MovieRatingSerializer(RatingSerializer):
    class Meta(RatingSerializer.Meta):
        model = MovieRating

class SeriesRatingSerializer(RatingSerializer):
    class Meta(RatingSerializer.Meta):
        model = SeriesRating

class VideoRatingSerializer(RatingSerializer):
    class Meta(RatingSerializer.Meta):
        model = VideoRating

class MovieSerializer(serializers.ModelSerializer):
    video_360p_url = serializers.SerializerMethodField()
    video_720p_url = serializers.SerializerMethodField()
    video_1080p_url = serializers.SerializerMethodField()
    screenshots = MovieScreenshotSerializer(many=True, read_only=True)
    ratings = MovieRatingSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    user_status = serializers.SerializerMethodField()

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
    def get_average_rating(self, obj):
        return obj.ratings.aggregate(avg_rating=models.Avg('value'))['avg_rating']
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return rating.value if rating else None
        return None
    
    def get_user_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            statuses = UserContentStatus.objects.filter(
                user=request.user,
                content_type='movie',
                content_id=obj.id
            ).values_list('status', flat=True)
            return list(statuses)
        return []
        
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'thumbnail',
                 'video_360p_url', 'video_720p_url', 'video_1080p_url', 
                 'typeOF', 'screenshots', 'ratings', 'average_rating', 'user_rating',
                 'user_status']
        
class VideoSerializer(serializers.ModelSerializer):
    video_360p_url = serializers.SerializerMethodField()
    video_720p_url = serializers.SerializerMethodField()
    video_1080p_url = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    ratings = VideoRatingSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
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

    def get_average_rating(self, obj):
        return obj.ratings.aggregate(avg_rating=models.Avg('value'))['avg_rating']
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return rating.value if rating else None
        return None
    
    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'thumbnail',
                 'video_360p_url', 'video_720p_url', 'video_1080p_url', 
                 'typeOF', 'author', 'screenshots', 'ratings', 'average_rating', 'user_rating']
        

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
    ratings = SeriesRatingSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()

    def get_average_rating(self, obj):
        return obj.ratings.aggregate(avg_rating=models.Avg('value'))['avg_rating']
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return rating.value if rating else None
        return None
    
    class Meta:
        model = Series
        fields = ['id', 'title', 'description', 'thumbnail', 'typeOF', 
                 'episodes', 'screenshots', 'ratings', 'average_rating', 'user_rating']

from rest_framework import serializers
from movietheater.models import CustomUser  # Импортируйте вашу кастомную модель
from rest_framework.validators import UniqueValidator

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = CustomUser  # Используйте вашу кастомную модель
        fields = ('username', 'password', 'email')  # Укажите поля вашей модели

    def create(self, validated_data):
        user = CustomUser.objects.create(  # Используйте вашу кастомную модель
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'phone', 'avatar', 'avatar_url')
        extra_kwargs = {
            'avatar': {'write_only': True}
        }

    def get_avatar_url(self, obj):
        if obj.avatar:
            return self.context['request'].build_absolute_uri(obj.avatar.url)
        return None


class MovieNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'thumbnail']

class SeriesNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Series
        fields = ['id', 'title', 'thumbnail']

class UserContentStatusSerializer(serializers.ModelSerializer):
    content_object = serializers.SerializerMethodField()

    class Meta:
        model = UserContentStatus
        fields = ['content_type', 'content_id', 'status', 'content_object']

    def get_content_object(self, obj):
        if obj.content_type == 'movie':
            try:
                movie = Movie.objects.get(id=obj.content_id)
                return MovieNestedSerializer(movie, context=self.context).data
            except Movie.DoesNotExist:
                return None
        elif obj.content_type == 'series':
            try:
                series = Series.objects.get(id=obj.content_id)
                return SeriesNestedSerializer(series, context=self.context).data
            except Series.DoesNotExist:
                return None
        return None