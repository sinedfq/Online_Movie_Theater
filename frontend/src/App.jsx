import React from 'react';
import axios from 'axios';
import './App.css';

class App extends React.Component {
  state = { 
    movies: [], 
    loading: true,
    error: null
  }

  componentDidMount() {
    axios.get('http://127.0.0.1:8000/')
      .then(res => {
        this.setState({
          movies: res.data,
          loading: false
        });
      })
      .catch(err => {
        console.error('Ошибка при загрузке данных:', err);
        this.setState({
          error: 'Не удалось загрузить фильмы',
          loading: false
        });
      });
  }

  extractYouTubeId(url) {
    // Обрабатываем разные форматы YouTube URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  renderVideo(videoUrl) {
    const youtubeId = this.extractYouTubeId(videoUrl);
    
    if (youtubeId) {
      return (
        <div className="video-responsive">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
          />
        </div>
      );
    }

    return (
      <video controls width="100%">
        <source src={videoUrl} type="video/mp4" />
        Ваш браузер не поддерживает видео тег.
      </video>
    );
  }

  render() {
    const { movies, loading, error } = this.state;

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
      <div className="app">
        <header className="app-header">
          <h1>Онлайн Кинотеатр</h1>
        </header>
        
        <main className="movie-list">
          {movies.map((movie, index) => (
            <div key={index} className="movie-card">
              <h2>{movie.title}</h2>
              <p>{movie.description}</p>
              {this.renderVideo(movie.video_url)}
            </div>
          ))}
        </main>
      </div>
    );
  }
}

export default App;