import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const fetchContent = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/content/`, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    throw error;
  }
};

export const fetchSeries = async (seriesId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/series/${seriesId}/`, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки сериала:", error);
    throw error;
  }
};