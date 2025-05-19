import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const handleError = (error) => {
    if (error.response) {
        // Сервер ответил с кодом состояния, выходящим за пределы 2xx
        console.error('Response error:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
    } else if (error.request) {
        // Запрос был сделан, но ответ не получен
        console.error('Request error:', error.request);
    } else {
        // Произошла ошибка при настройке запроса
        console.error('Error:', error.message);
    }
    return Promise.reject(error);
};

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return handleError(error);
  }
);

// Interceptor для обработки 401 ошибки и обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Запрашиваем новый access token
        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        // Сохраняем новые токены
        localStorage.setItem('access_token', response.data.access);
        
        // Обновляем заголовок авторизации
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;

        // Повторяем оригинальный запрос
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        // Удаляем токены и перенаправляем на логин
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Функция для входа пользователя
export const login = async (username, password) => {
  try {
    const response = await api.post('/token/', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Функция для регистрации пользователя
export const register = async (userData) => {
  try {
    const response = await api.post('/register/', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Функция для получения профиля пользователя
export const fetchProfile = async () => {
  try {
    const response = await api.get('/profile/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
};

// Функция для обновления аватара
export const updateAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await api.patch('/profile/update_avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update avatar:', error);
    throw error;
  }
};

// Функция для получения контента
export const fetchContent = async () => {
  try {
    const response = await api.get('/content/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch content:', error);
    throw error;
  }
};

// Функция для получения информации о сериале
export const fetchSeries = async (id) => {
  try {
    const response = await api.get(`/series/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch series:', error);
    throw error;
  }
};

// Функция для получения рейтингов сериала
export const fetchSeriesRatings = async (seriesId) => {
  try {
    const response = await api.get(`/series/${seriesId}/ratings/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch series ratings:', error);
    throw error;
  }
};

// Функция для оценки сериала
export const rateSeries = async (seriesId, value) => {
  try {
    const response = await api.post(`/series/${seriesId}/rate/`, {
      value,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to rate series:', error);
    throw error;
  }
};

// Функция для получения информации о сериале
export const fetchMovies = async (id) => {
  try {
    const response = await api.get(`/movies/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch series:', error);
    throw error;
  }
};

// Функция для получения рейтингов сериала
export const fetchMoviesRatings = async (seriesId) => {
  try {
    const response = await api.get(`/movies/${seriesId}/ratings/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch series ratings:', error);
    throw error;
  }
};

// Функция для оценки сериала
export const rateMovies = async (seriesId, value) => {
  try {
    const response = await api.post(`/movies/${seriesId}/rate/`, {
      value,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to rate series:', error);
    throw error;
  }
};

export default api;