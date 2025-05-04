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

      <div className="quality-selector">
        <label>Качество:</label>
        <select
          value={quality || ''}
          onChange={(e) => setQuality(e.target.value)}
          disabled={!video360p && !video720p && !video1080p}
          style={{
            padding: '10px 15px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px solid #4f46e5',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            width: '120px',
            appearance: 'none',
            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234f46e5%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            backgroundSize: '12px auto'
          }}
          className={`select-quality ${(!video360p && !video720p && !video1080p) ? 'disabled' : ''}`}
        >
          {video360p && <option value={video360p}>360p</option>}
          {video720p && <option value={video720p}>720p</option>}
          {video1080p && <option value={video1080p}>1080p</option>}
        </select>
      </div>

    </div>
  );
};

export default VideoPlayer;
