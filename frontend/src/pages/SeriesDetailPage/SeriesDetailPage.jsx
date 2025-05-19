import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSeries, fetchProfile } from '../../services/api';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import ScreenshotGallery from '../../components/ScreenshotGallery/ScreenshotGallery';
import StarRating from '../../components/StarRating/StarRating';
import './SeriesDetailsPage.css';
import api from '../../services/api';

const SeriesDetailsPage = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [isChangingRating, setIsChangingRating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const dropdownRef = useRef(null);

  // Получаем текущего пользователя
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

  // Обработчик клика вне dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Загружаем статусы
  const loadContentStatuses = async () => {
    try {
      const response = await api.get('/user-content-status/', {
        params: {
          content_type: 'series',
          content_id: id
        }
      });

      // Сбрасываем статусы перед установкой
      setIsFavorite(false);
      setIsWatched(false);
      setIsInWatchlist(false);

      // Устанавливаем текущие статусы
      response.data.forEach(status => {
        if (status.status === 'favorite') setIsFavorite(true);
        if (status.status === 'watched') setIsWatched(true);
        if (status.status === 'watchlist') setIsInWatchlist(true);
      });

    } catch (error) {
      console.error('Error loading content statuses:', error);
    }
  };

  // Загружаем данные сериала
  useEffect(() => {
    const loadSeries = async () => {
      try {
        const seriesData = await fetchSeries(id);

        if (!seriesData) {
          throw new Error('No series data received');
        }

        setSeries(seriesData);
        setAverageRating(seriesData.average_rating || 0);
        setRatingsCount(seriesData.ratings?.length || 0);

        // Находим оценку текущего пользователя
        if (currentUser) {
          const userRate = seriesData.ratings?.find(r => r.user === currentUser)?.value || null;
          setUserRating(userRate);

          // Загружаем статусы
          await loadContentStatuses();
        }

        if (seriesData.episodes?.length > 0) {
          setSelectedEpisode(seriesData.episodes[0]);
        }
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {

        setLoading(false);
        setAnimationStage(1);
        setTimeout(() => setAnimationStage(2), 1500);
      }
    };

    if (currentUser) {
      loadSeries();
    }
  }, [id, currentUser]);

  // Обработка статусов
  const toggleStatus = async (status) => {
    if (!currentUser) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    try {
      setIsLoadingStatus(true);
      await api.post('/user-content-status/toggle_status/', {
        content_type: 'series',
        content_id: id,
        status: status
      });

      // Обновляем соответствующий статус
      switch (status) {
        case 'favorite':
          setIsFavorite(prev => !prev);
          break;
        case 'watched':
          setIsWatched(prev => !prev);
          break;
        case 'watchlist':
          setIsInWatchlist(prev => !prev);
          break;
      }

    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Ошибка при изменении статуса');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Обработка оценки
  const handleRating = async (value) => {
    const token = localStorage.getItem('access_token');

    if (!token || !currentUser) {
      alert('Пожалуйста, войдите в систему, чтобы оценить сериал');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/series/${id}/rate/`, {
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

      const updatedSeries = await fetchSeries(id);
      setSeries(updatedSeries);
      setAverageRating(updatedSeries.average_rating || 0);
      setRatingsCount(updatedSeries.ratings?.length || 0);

      const userRate = updatedSeries.ratings?.find(r => r.user === currentUser)?.value || null;
      setUserRating(userRate);

      setIsChangingRating(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.message);
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

  if (!series) {
    return <div className="error">Сериал не найден</div>;
  }

  return (
    <div className="series-detail-page">
      <div className="series-header">
        <div className="series-poster">
          <img
            src={series.thumbnail}
            alt={series.title}
            className="thumbnail-image-details"
          />

          <div className="action-buttons">
            {/* Кнопка избранного */}
            <button
              onClick={() => toggleStatus('favorite')}
              disabled={isLoadingStatus}
              className={`action-btn ${isFavorite ? 'active' : ''}`}
            >
              {isFavorite ? '★' : '☆'}
            </button>

            {/* Выпадающий список для других статусов */}
            <div className="status-dropdown-container" ref={dropdownRef}>
              <button
                className={`status-dropdown-toggle ${isWatched || isInWatchlist ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isLoadingStatus}
              >
                Другие статусы
                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>

              {isDropdownOpen && (
                <div className="status-dropdown-menu">
                  <button
                    className={`dropdown-item ${isWatched ? 'active' : ''}`}
                    onClick={() => toggleStatus('watched')}
                  >
                    {isWatched ? '✓ Просмотрено' : 'Пометить просмотренным'}
                  </button>
                  <button
                    className={`dropdown-item ${isInWatchlist ? 'active' : ''}`}
                    onClick={() => toggleStatus('watchlist')}
                  >
                    {isInWatchlist ? '⌚ В списке' : 'Добавить в список'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="series-info">
          <h1>{series.title}</h1>
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

          <hr />
          <div>{renderLinks(series.description)}</div>
        </div>
      </div>

      {series.screenshots?.length > 0 && (
        <div className="screenshots-section">
          <ScreenshotGallery screenshots={series.screenshots} />
        </div>
      )}

      <div className="series-content">
        <div className="episodes-list">
          <h3>Список серий:</h3>
          <ul className="episodes-container">
            {series.episodes.map((episode) => (
              <li
                key={episode.id}
                className={`episode-item ${selectedEpisode?.id === episode.id ? 'selected' : ''}`}
                onClick={() => setSelectedEpisode(episode)}
              >
                <span className="episode-number">{episode.episode_number}</span>
                <div className="episode-info">
                  <span className="episode-title">{episode.title}</span>
                  {selectedEpisode?.id === episode.id && (
                    <span className="now-playing">Сейчас играет</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="video-wrapper">
          {selectedEpisode && (
            <>
              <h3 style={{ color: '#ffffffa8', padding: '10px' }} align="center">
                Серия {selectedEpisode.episode_number}: {selectedEpisode.title}
              </h3>
              <VideoPlayer
                key={selectedEpisode.id}
                video360p={selectedEpisode.video_360p_url}
                video720p={selectedEpisode.video_720p_url}
                video1080p={selectedEpisode.video_1080p_url}
                poster={series.thumbnail}
                movieId={selectedEpisode.id}
                onBufferingChange={setIsBuffering}
              />
            </>
          )}

          {isBuffering && (
            <div className="buffering-indicator">Буферизация...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailsPage;