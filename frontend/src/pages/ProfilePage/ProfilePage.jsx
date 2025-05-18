import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultAvatar from './text.jpg';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Функция для загрузки данных профиля
  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserData(response.data);
      console.log(response.data);
      setAvatarPreview(response.data.avatar ? `http://localhost:8000${response.data.avatar}` : defaultAvatar); // Форматируем URL аватара
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

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

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
      const response = await axios.patch(
        'http://localhost:8000/api/profile/update_avatar/',
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
      // Возвращаем прежний аватар при ошибке
      setAvatarPreview(userData?.avatar_url || defaultAvatar);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (loading) {
    return <div className="profile-container"><div className="loading-spinner"></div></div>;
  }

  if (error) {
    return <div className="profile-container"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="avatar-container">
          <img 
            src={avatarPreview} 
            alt="Аватар" 
            className="profile-avatar"
          />
          <label className="avatar-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <span className="avatar-upload-text">Изменить</span>
          </label>
        </div>
        
        <h2>{userData?.username}</h2>
        
        <div className="profile-info">
          <div className="profile-field">
            <span className="field-label">Email:</span>
            <span className="field-value">{userData?.email}</span>
          </div>
          
          {userData?.phone && (
            <div className="profile-field">
              <span className="field-label">Phone:</span>
              <span className="field-value">{userData.phone}</span>
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;