import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieCard.css'

const ContentCard = ({ content }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (content.typeOF === 'movie') {
      navigate(`/movie/${content.id}`);
    } else if (content.typeOF === 'series') {
      navigate(`/series/${content.id}`);
    } else if (content.typeOF === 'video') {
      navigate(`/videos/${content.id}`);
    } else {
      // Обработка неизвестного типа, если нужно
      navigate('/');
    }
  };

  const getContentType = (type) => {
    switch(type) {
      case 'movie':
        return 'Фильм';
      case 'series':
        return 'Сериал';
      case 'video':
        return 'Видео';
      default:
        return 'Контент';
    }
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <div className="thumbnail-container">
        <img 
          src={content.thumbnail} 
          alt={content.title}
          className="thumbnail-image"
        />
      </div>
      <div className="movie-content">
        <h2 className="movie-title">{content.title}</h2>
        <p className="movie-description">{getContentType(content.typeOF)}</p>
      </div>
    </div>
  );
};

export default ContentCard;