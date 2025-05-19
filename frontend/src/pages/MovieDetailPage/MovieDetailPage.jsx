import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchContent, fetchProfile } from '../../services/api';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import ScreenshotGallery from '../../components/ScreenshotGallery/ScreenshotGallery';
import StarRating from '../../components/StarRating/StarRating';
import './MovieDetailPage.css';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [isChangingRating, setIsChangingRating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  

  // Загрузка данных пользователя
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const userData = await fetchProfile();
          setCurrentUser(userData.username);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    loadUser();
  }, []);

  // Загрузка данных фильма
  useEffect(() => {
    const loadMovie = async () => {
      try {
        const contents = await fetchContent();

        const mergedContents = [
          ...contents.movies.map(m => ({ ...m, typeOF: 'movie' })),
          ...contents.series.map(s => ({ ...s, typeOF: 'series' })),
        ];

        const foundMovie = mergedContents.find(m => m.id.toString() === id && m.typeOF === 'movie');
        if (foundMovie) {
          setMovie(foundMovie);
          setAverageRating(foundMovie.average_rating || 0);
          setRatingsCount(foundMovie.ratings?.length || 0);

          if (currentUser) {
            const userRate = foundMovie.ratings?.find(r => r.user === currentUser)?.value || null;
            setUserRating(userRate);
          }
        }
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setLoading(false);
        setAnimationStage(1);
        setTimeout(() => setAnimationStage(2), 1500);
      }
    };

    loadMovie();
  }, [id, currentUser]);

  // Обработка оценки
  const handleRating = async (value) => {
    const token = localStorage.getItem('access_token');

    if (!token || !currentUser) {
      alert('Пожалуйста, войдите в систему, чтобы оценить фильм');
      return;
    }

    try {
      setIsChangingRating(true);
      
      const response = await fetch(`http://localhost:8000/api/movies/${id}/rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке оценки');
      }

      // Обновляем данные фильма
      const contents = await fetchContent();
      const updatedMovie = contents.movies.find(m => m.id.toString() === id);
      
      if (updatedMovie) {
        setMovie(updatedMovie);
        setAverageRating(updatedMovie.average_rating || 0);
        setRatingsCount(updatedMovie.ratings?.length || 0);

        // Обновляем оценку пользователя
        const userRate = updatedMovie.ratings?.find(r => r.user === currentUser)?.value || null;
        setUserRating(userRate);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.message);
    } finally {
      setIsChangingRating(false);
    }
  };

  const startChangingRating = () => {
    setIsChangingRating(true);
  };

  const cancelChangingRating = () => {
    setIsChangingRating(false);
  };

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
          <div className="rating-section">
            <div className="rating-stats">
              <div className="average-rating">
                <StarRating rating={averageRating} interactive={false} />
                <span className="rating-value">
                  {averageRating ? averageRating.toFixed(1) : 'Нет оценок'}
                </span>
                <span className="ratings-count">
                  ({ratingsCount} {ratingsCount === 1 ? 'оценка' :
                    ratingsCount > 1 && ratingsCount < 5 ? 'оценки' : 'оценок'})
                </span>
              </div>
            </div>

            {currentUser && (
              userRating !== null && !isChangingRating ? (
                <div className="user-rating-container">
                  <div className="user-rating-display">
                    <span>Ваша оценка: </span>
                    <StarRating rating={userRating} interactive={false} />
                    <button
                      onClick={startChangingRating}
                      className="change-rating-btn"
                    >
                      Изменить
                    </button>
                  </div>
                </div>
              ) : (
                <div className="user-rating-edit">
                  <span>Ваша оценка: </span>
                  <StarRating
                    rating={userRating || 0}
                    interactive={true}
                    onRatingChange={handleRating}
                  />
                  {isChangingRating && (
                    <button
                      onClick={cancelChangingRating}
                      className="cancel-rating-btn"
                    >
                      Отмена
                    </button>
                  )}
                </div>
              )
            )}
          </div>
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