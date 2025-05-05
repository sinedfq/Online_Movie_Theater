import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSeries } from '../../services/api';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import ScreenshotGallery from '../../components/ScreenshotGallery/ScreenshotGallery';
import './SeriesDetailsPage.css';

const SeriesDetailsPage = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const seriesData = await fetchSeries(id);
        setSeries(seriesData);
        if (seriesData.episodes && seriesData.episodes.length > 0) {
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

    loadSeries();
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

  // Если данные загружаются или анимация не завершена
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
        </div>

        <div className="series-info">
          <h1>{series.title}</h1>
          <hr></hr>
          <div>{renderLinks(series.description)}</div>
        </div>
      </div>

      {series.screenshots && series.screenshots.length > 0 && (
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
              <h3 style={{ color: '#ffffffa8', padding: '10px' }} align="center">Серия {selectedEpisode.episode_number}: {selectedEpisode.title}</h3>
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