import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieCard.css'

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
      <div className="thumbnail-container">
        <img 
          src={movie.thumbnail} 
          alt={movie.title}
          className="thumbnail-image"
        />
      </div>
      <div className="movie-content">
        <h2 className="movie-title">{movie.title}</h2>
        <p className="movie-description">{movie.description}</p>
      </div>
    </div>
  );
};

export default MovieCard;
