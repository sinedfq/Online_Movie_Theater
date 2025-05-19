import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css'

const VideoPlayer = ({ movieId, video360p, video720p, video1080p, onBufferingChange, poster: thumbnail }) => {
  const [quality, setQuality] = useState(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const controlsRef = useRef(null);

  const getVideoUrl = () => {
    if (quality) return quality;
    if (video1080p) return video1080p;
    if (video720p) return video720p;
    if (video360p) return video360p;
    return null;
  };

  const availableQualities = [
    { url: video1080p, label: '1080p' },
    { url: video720p, label: '720p' },
    { url: video360p, label: '360p' }
  ].filter(q => q.url);

  useEffect(() => {
    const availableQuality = getVideoUrl();
    setQuality(availableQuality);
  }, [video360p, video720p, video1080p]);

  const handlePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(current);
    setDuration(dur);

    const progressPercent = (current / dur) * 100;
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.setProperty('--progress', `${progressPercent}%`);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      videoRef.current.parentElement.requestFullscreen?.().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleQualitySelect = (url) => {
    const current = videoRef.current.currentTime;
    const isCurrentlyPlaying = !videoRef.current.paused;

    setQuality(url);
    setShowQualityMenu(false);

    setTimeout(() => {
      videoRef.current.currentTime = current;
      if (isCurrentlyPlaying) {
        videoRef.current.play().catch(e => console.error('Playback error:', e));
      }
    }, 100); // небольшой таймаут, чтобы успел подгрузиться src
  };

  useEffect(() => {
    const video = videoRef.current;
    const handleKeyDown = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        handlePlayPause();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      className="video-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        key={`${movieId}-${quality}`}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
          cursor: 'pointer'
        }}
        onClick={handlePlayPause}
        onDoubleClick={toggleFullscreen}
        preload="auto"
        poster={thumbnail}
        controlsList="nodownload"
        onWaiting={() => onBufferingChange(true)}
        onPlaying={() => {
          onBufferingChange(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={(e) => setDuration(e.target.duration)}
        onError={(e) => console.error(`Ошибка видео ${movieId}:`, e.target.error)}
      >
        <source src={getVideoUrl()} type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>

      <div
        className={`video-controls ${showControls ? 'visible' : ''}`}
        ref={controlsRef}
      >
        <div className="progress-bar-container">
          <input
            type="range"
            className="progress-bar"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
          />
        </div>

        <div className="main-controls">
          <div className="left-controls">
            <button className="control-btn" onClick={handlePlayPause}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <div className="volume-control">
              <button className="control-btn">
                {volume === 0 ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
              </button>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="right-controls">
            <div className="quality-selector">
              <button
                className="control-btn quality-btn"
                onClick={() => setShowQualityMenu(!showQualityMenu)}
              >
                 {availableQualities.find(q => q.url === quality)?.label || 'Авто'}
              </button>
              {showQualityMenu && (
                <div className="quality-menu">
                  {availableQualities.map((q) => (
                    <button
                      key={q.url}
                      className={`quality-option ${quality === q.url ? 'active' : ''}`}
                      onClick={() => handleQualitySelect(q.url)}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="control-btn" onClick={toggleFullscreen}>
              {isFullscreen ? '🞬' : '⛶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;