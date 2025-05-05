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
  const [animationStage, setAnimationStage] = useState(0);

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
        setAnimationStage(1);
        setTimeout(() => setAnimationStage(2), 1500);
      }
    };

    loadVideo();
  }, [id]);

  const renderLinks = (text) => {
    if (!text) return null;
    
    const regex = /(https?:\/\/[^\s]+)/g;
    return text.split('\n').map((paragraph, pIndex) => (
      <p key={pIndex} style={{ marginBottom: '1em' }}>
        {paragraph.split(regex).map((part, index) => {
          if (part.match(regex)) {
            const url = part.trim();
            return (
              <a 
                key={index} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1976d2', wordBreak: 'break-all' }}
              >
                {url}
              </a>
            );
          }
          return part;
        })}
      </p>
    ));
  };
  
  if (loading || animationStage < 2) {
    return (
      <div className={`preloader ${animationStage >= 1 ? 'expanding' : ''}`}>
        <div className="loader-circle"></div>
        <div className="loader-text"></div>
      </div>
    );
  }

  if (!video) {
    return <div className="error">Видео не найдено</div>;
  }

  return (
    <div className="movie-detail-page">


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

      <div className="movie-info" style={{paddingTop: '20px'}}> 
          <h1>{video.title}</h1>
          <p>Автор: {video.author}</p>
          <hr></hr>
          <div>{renderLinks(video.description)}</div>
        </div>
    </div>
  );
};

export default VideoDetailPage;