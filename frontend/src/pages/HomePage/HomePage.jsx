import React, { useEffect, useState } from 'react';
import { fetchContent } from '../../services/api';
import ContentList from '../../components/MovieList/ContentList';
import './HomePage.css';

const HomePage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await fetchContent();
        const mergedContent = [
          ...data.movies.map(movie => ({ ...movie, typeOF: 'movie' })),
          ...data.series.map(series => ({ ...series, typeOF: 'series' })),
          ...data.videos.map(video => ({ ...video, typeOF: 'video' }))
        ];
  
        setContents(mergedContent);
      } catch (error) {
        console.error(error);
      } finally {
        setAnimationStage(1);
        setLoading(false);
      }
    };
  
    loadContent();
  }, []);
  

  if (loading) {
    return <div className="loading">Загрузка контента...</div>;
  }

  return (
    <div className="home-page">
      <ContentList contents={contents} />
    </div>
  );
};

export default HomePage;