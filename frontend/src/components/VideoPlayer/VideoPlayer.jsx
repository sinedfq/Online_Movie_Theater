import React from 'react';

const VideoPlayer = ({ videoUrl, movieId, onBufferingChange }) => {
  return (
    <div className="video-container">
      <video
        key={`video-${movieId}`}
        controls
        width="100%"
        preload="auto"
        controlsList="nodownload"
        onWaiting={() => onBufferingChange(true)}
        onPlaying={() => onBufferingChange(false)}
        onError={(e) => console.error(`Ошибка видео ${movieId}:`, e.target.error)}
      >
        <source src={videoUrl} type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>
    </div>
  );
};

export default VideoPlayer;