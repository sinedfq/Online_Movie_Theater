import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovies } from '../../services/api';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';

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
      <h1>{movie.title}</h1>
      <p>{movie.description}</p>
      
      <div className="video-wrapper">
        <VideoPlayer 
          videoUrl={movie.video_url}
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