import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSeries } from '../../services/api';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import './SeriesDetailsPage.css';

const SeriesDetailsPage = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const loadSeries = async () => {
      try {
        const seriesData = await fetchSeries(id);
        console.log('Series data received:', seriesData);
        setSeries(seriesData);
        if (seriesData.episodes && seriesData.episodes.length > 0) {
          setSelectedEpisode(seriesData.episodes[0]);
        }
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
  }, [id]);

  useEffect(() => {
    if (selectedEpisode) {
      console.log('Episode updated:', selectedEpisode);
    }
  }, [selectedEpisode]);

  const handleEpisodeSelect = (episode) => {
    console.log('Previous episode:', selectedEpisode);
    console.log('Selected episode:', episode);
    setSelectedEpisode(episode);
  };

  if (loading) {
    return <div className="loading">Загрузка сериала...</div>;
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
          <p>{series.description}</p>
        </div>
      </div>

      <div className="series-content">
        <div className="episodes-list">
          <h3>Список серий:</h3>
          <ul className="episodes-container">
            {series.episodes.map((episode) => (
              <li
                key={episode.id}
                className={`episode-item ${selectedEpisode?.id === episode.id ? 'selected' : ''}`}
                onClick={() => handleEpisodeSelect(episode)}
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
              <h3>Серия {selectedEpisode.episode_number}: {selectedEpisode.title}</h3>
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
