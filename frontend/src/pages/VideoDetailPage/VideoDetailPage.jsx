import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchContent } from '../../services/api';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import './VideoDetailPage.css';

const VideoDetailPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const contents = await fetchContent();

        const foundVideo = contents.videos?.find(v => v.id.toString() === id);
        
        if (foundVideo) {
          setVideo({ ...foundVideo, typeOF: 'video' });
        } else {
          console.error('Video not found');
        }
      } catch (error) {
        console.error('Error loading video:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id]);

  if (loading) {
    return <div className="loading">Загрузка видео...</div>;
  }

  if (!video) {
    return <div className="error">Видео не найдено</div>;
  }

  return (
    <div className="movie-detail-page">
      <div className="movie-header">
        <div className="movie-poster">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="thumbnail-image-details"
          />
        </div>

        <div className="movie-info">
          <h1>{video.title}</h1>
          <p>{video.description}</p>
        </div>
      </div>

      <div className="video-wrapper">
        <VideoPlayer
          video360p={video.video_360p_url}
          video720p={video.video_720p_url}
          video1080p={video.video_1080p_url}
          poster={video.thumbnail}
          videoId={video.id}
          onBufferingChange={setIsBuffering}
        />

        {isBuffering && (
          <div className="buffering-indicator">Буферизация...</div>
        )}
      </div>
    </div>
  );
};

export default VideoDetailPage;