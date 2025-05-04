import React, { useEffect, useState } from 'react';
import { fetchMovies } from '../../services/api';
import MovieList from '../../components/MovieList/MovieList'; // Изменённый импорт
// import './HomePage.css';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await fetchMovies();
        setMovies(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  if (loading) {
    return <div className="loading">Загрузка списка фильмов...</div>;
  }

  return (
    <div className="home-page">
      <MovieList movies={movies} />
    </div>
  );
};

export default HomePage;