import React from 'react';
import { Link } from 'react-router-dom';
import './ProfileCard.css';

const BASE_URL = 'http://localhost:8000';

const ProfileCard = ({ item }) => {
  if (!item) return <div>Загрузка...</div>;

  const contentType = item.content_type;
  const contentId = item.content_id;
  const contentObject = item.content_object || {};
  const title = contentObject.title || 'Без названия';
  const thumbnailPath = contentObject.thumbnail || '';

  const getLinkUrl = () => {
    if (!contentId) return '#';
    switch (contentType) {
      case 'movie':
        return `/movies/${contentId}`;
      case 'series':
        return `/series/${contentId}`;
      default:
        return '#';
    }
  };

  const thumbnailUrl = thumbnailPath
    ? thumbnailPath.startsWith('http')
      ? thumbnailPath
      : `${BASE_URL}${thumbnailPath.startsWith('/') ? '' : '/'}${thumbnailPath}`
    : 'https://via.placeholder.com/300x450?text=No+Image';

  return (
    <Link to={getLinkUrl()} className="content-card">
      <div className="card-image">
        <img
          src={thumbnailUrl}
          alt={title}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450?text=Image+Not+Found';
          }}
        />
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{contentType === 'movie' ? 'Фильм' : contentType === 'series' ? 'Сериал' : ''}</p>
      </div>
    </Link>
  );
};

export default ProfileCard;
