import React from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <h2>{movie.title}</h2>
      <p>{movie.description}</p>

      {/* Показываем превью */}
      <div className="thumbnail">
        <img 
          src={movie.thumbnail} 
          alt={movie.title} 
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
        />
      </div>
    </div>
  );
};

export default MovieCard;
