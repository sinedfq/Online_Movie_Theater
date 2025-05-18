import React from 'react';
import ContentCard from '../MovieCard/ContentCard';
import './MovieList.css';

const ContentList = ({ contents }) => {
  // Проверка данных
  if (!contents || !Array.isArray(contents)) {
    return <div>Нет данных для отображения</div>;
  }

  return (
    <div className="movie-list">
      {contents.map((content, index) => {
        if (!content.id) {
          console.error('Элемент без ID:', content);
          return null;
        }
        
        return (
          <ContentCard 
            key={`${content.typeOF}-${content.id}-${index}`} // Комбинированный ключ
            content={content}
          />
        );
      })}
    </div>
  );
};

export default ContentList;