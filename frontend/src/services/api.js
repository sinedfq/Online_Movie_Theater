import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const fetchMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movies/`, { timeout: 10000 });
    return response.data.map(movie => ({
      ...movie,
      video_url: `${movie.video_url}?t=${Date.now()}-${movie.id}`
    }));
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    throw error;
  }
};