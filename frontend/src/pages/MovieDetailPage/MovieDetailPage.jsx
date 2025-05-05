import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchContent } from '../../services/api';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import ScreenshotGallery from '../../components/ScreenshotGallery/ScreenshotGallery';
import './MovieDetailPage.css';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const contents = await fetchContent();

        const mergedContents = [
          ...contents.movies.map(m => ({ ...m, typeOF: 'movie' })),
          ...contents.series.map(s => ({ ...s, typeOF: 'series' })),
        ];

        const foundMovie = mergedContents.find(m => m.id.toString() === id && m.typeOF === 'movie');
        setMovie(foundMovie);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setAnimationStage(1);
        setTimeout(() => setAnimationStage(2), 1500);
      }
    };

    loadMovie();
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

  if (!movie) {
    return <div className="error">Фильм не найден</div>;
  }

  return (
    <div className="movie-detail-page">
      <div className="movie-header">
        <div className="movie-poster">
          <img
            src={movie.thumbnail}
            alt={movie.title}
            className="thumbnail-image-details"
          />
        </div>

        <div className="movie-info">
          <h1>{movie.title}</h1>
          <div>{renderLinks(movie.description)}</div>
        </div>
      </div>

      {movie.screenshots && movie.screenshots.length > 0 && (
        <div className="screenshots-section">
          <ScreenshotGallery screenshots={movie.screenshots} />
        </div>
      )}

      <div className="video-wrapper">
        <VideoPlayer
          video360p={movie.video_360p_url}
          video720p={movie.video_720p_url}
          video1080p={movie.video_1080p_url}
          poster={movie.thumbnail}
          movieId={movie.id}
          onBufferingChange={setIsBuffering}
        />

        {isBuffering && (
          <div className="buffering-indicator">Буферизация...</div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsPage;