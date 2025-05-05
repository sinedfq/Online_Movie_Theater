import React, { useState } from 'react';
import './ScreenshotGallery.css';

const ScreenshotGallery = ({ screenshots }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!screenshots || screenshots.length === 0) return null;

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="screenshot-gallery">
      <h4>Скриншоты:</h4>
      <div className="screenshot-grid">
        {screenshots.map((shot) => (
          <div key={shot.id} className="screenshot-item">
            <img
              src={shot.image_url}
              alt="screenshot"
              className="screenshot-thumbnail"
              onClick={() => handleImageClick(shot.image_url)}
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Large screenshot" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGallery;
