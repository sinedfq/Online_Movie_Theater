import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultAvatar from './text.jpg';
import './ProfilePage.css';
import api from '../../services/api';
import ProfileCard from '../../components/ProfileCard/ProfileCard'
import '../../components/ProfileCard/ProfileCard.css'

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [watched, setWatched] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [activeTab, setActiveTab] = useState('favorites');

  // Функция для загрузки данных профиля
  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.get('/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUserData(response.data);
      setAvatarPreview(response.data.avatar ? `http://localhost:8000${response.data.avatar}` : defaultAvatar);
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
      } else {
        setError('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Функция для загрузки списков пользователя
  const fetchUserLists = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const [favRes, watchedRes, watchlistRes] = await Promise.all([
        api.get('/user-content-status/favorites/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        api.get('/user-content-status/watched/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        api.get('/user-content-status/watchlist/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setFavorites(favRes.data);
      setWatched(watchedRes.data);
      setWatchlist(watchlistRes.data);
    } catch (error) {
      console.error('Error fetching user lists:', error);
    } finally {
      setLoadingLists(false);
    }
  };

  // Функция для загрузки данных контента по ID
  const fetchContentDetails = async (contentType, contentId) => {
    try {
      const endpoint = contentType === 'movie' ? `/movies/${contentId}/` : `/series/${contentId}/`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${contentType} details:`, error);
      return null;
    }
  };

  // Функция для обработки изменения аватара
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Создаем превью для отображения
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Отправка файла на сервер
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('access_token');
      const response = await api.patch(
        '/profile/update_avatar/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Обновляем данные пользователя
      setUserData(prev => ({
        ...prev,
        avatar_url: response.data.avatar_url
      }));

      alert('Аватар успешно обновлен!');
    } catch (err) {
      console.error('Error updating avatar:', err);
      alert('Ошибка при обновлении аватара');
      setAvatarPreview(userData?.avatar_url || defaultAvatar);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  useEffect(() => {
    fetchProfile();
    fetchUserLists();
  }, [navigate]);

  if (loading) {
    return <div className="profile-container"><div className="loading-spinner"></div></div>;
  }

  if (error) {
    return <div className="profile-container"><div className="error-message">{error}</div></div>;
  }

  const renderContentList = (items) => {
    if (loadingLists) {
      return <div className="loading">Загрузка...</div>;
    }

    if (items.length === 0) {
      return <div className="empty-list">Список пуст</div>;
    }

    return (
      <div className="cards-container">
        {items.map(item => (
          <ProfileCard
            key={`${item.content_type}-${item.content_id}`}
            item={item}
            contentType={item.content_type}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="avatar-container">
          <label className="avatar-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <img
              src={avatarPreview}
              alt="Аватар"
              className="profile-avatar"
            />
            <div className="avatar-overlay">
              <span className="avatar-upload-text">Изменить</span>
            </div>
          </label>
        </div>

        <h2>{userData?.username}</h2>

        <div className="profile-info">
          <div className="profile-field">
            <span className="field-label">Почта:</span>
            <span className="field-value">{userData?.email}</span>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Избранное
          </button>
          <button
            className={`tab-btn ${activeTab === 'watched' ? 'active' : ''}`}
            onClick={() => setActiveTab('watched')}
          >
            Просмотрено
          </button>
          <button
            className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            Смотреть позже
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'favorites' && renderContentList(favorites)}
          {activeTab === 'watched' && renderContentList(watched)}
          {activeTab === 'watchlist' && renderContentList(watchlist)}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Выйти
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;