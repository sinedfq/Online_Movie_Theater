import React from 'react';
import ContentCard from '../MovieCard/ContentCard';
import './MovieList.css';

const ContentList = ({ contents }) => {
  
  return (
    <div className="movie-list">
      {contents.map(content => (
        <ContentCard 
          key={content.id}
          content={content}
        />
      ))}
    </div>
  );
};

export default ContentList;