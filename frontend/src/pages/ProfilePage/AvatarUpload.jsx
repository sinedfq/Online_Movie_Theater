import React, { useState } from 'react';
import axios from 'axios';

const AvatarUpload = ({ onAvatarUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', selectedFile);

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
      
      onAvatarUpdate(response.data.avatar_url);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="avatar-upload">
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <label htmlFor="avatar-upload" className="upload-label">
        {preview ? (
          <img src={preview} alt="Preview" className="avatar-preview" />
        ) : (
          <div className="upload-placeholder">Выберите изображение</div>
        )}
      </label>
      
      {selectedFile && (
        <button 
          onClick={handleUpload} 
          disabled={isUploading}
          className="upload-btn"
        >
          {isUploading ? 'Загрузка...' : 'Сохранить аватар'}
        </button>
      )}
    </div>
  );
};

export default AvatarUpload;