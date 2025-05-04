import React, { useState, useEffect } from 'react';

const VideoPlayer = ({ movieId, video360p, video720p, video1080p, onBufferingChange, poster: thumbnail }) => {
  const [quality, setQuality] = useState(null);

  const getVideoUrl = () => {
    if (quality) return quality;
    if (video1080p) return video1080p;
    if (video720p) return video720p;
    if (video360p) return video360p;
    return null;
  };

  useEffect(() => {
    const availableQuality = getVideoUrl();
    setQuality(availableQuality);
  }, [video360p, video720p, video1080p]);

  return (
    <div className="video-container">
      <div className="quality-selector">
        <label>Качество:</label>
        <select
          value={quality || ''}
          onChange={(e) => setQuality(e.target.value)}
          disabled={!video360p && !video720p && !video1080p}
        >
          {video360p && <option value={video360p}>360p</option>}
          {video720p && <option value={video720p}>720p</option>}
          {video1080p && <option value={video1080p}>1080p</option>}
        </select>
      </div>

      <video
        key={`${movieId}-${quality}`}
        controls
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          objectFit: 'contain'
        }}
        preload="auto"
        poster={thumbnail}
        controlsList="nodownload"
        onWaiting={() => onBufferingChange(true)}
        onPlaying={() => onBufferingChange(false)}
        onError={(e) => console.error(`Ошибка видео ${movieId}:`, e.target.error)}
      >
        <source src={getVideoUrl()} type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>
    </div>
  );
};

export default VideoPlayer;
