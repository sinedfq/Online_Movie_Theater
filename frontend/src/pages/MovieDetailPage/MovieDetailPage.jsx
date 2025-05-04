import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovies } from '../../services/api';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import './MovieDetailPage.css';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const movies = await fetchMovies();
        const foundMovie = movies.find(m => m.id.toString() === id);
        setMovie(foundMovie);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  if (loading) {
    return <div className="loading">Загрузка фильма...</div>;
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
          <p>{movie.description}</p>
        </div>
      </div>

      <div className="video-wrapper">
        <VideoPlayer
          video360p={movie.video_360p_url}
          video720p={movie.video_720p_url}
          video1080p={movie.video_1080p_url}
          poster = {movie.thumbnail}
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

export default MovieDetailPage;