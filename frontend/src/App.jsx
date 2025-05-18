import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import MovieDetailPage from './pages/MovieDetailPage/MovieDetailPage'
import Navbar from './components/NavBar/NavBar'
import SeriesDetailsPage from './pages/SeriesDetailPage/SeriesDetailPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import LoginForm from './pages/ProfilePage/LoginForm'
import VideoDetailPage from './pages/VideoDetailPage/VideoDetailPage'
import './App.css';
import RegisterForm from './pages/ProfilePage/RegisterForm';

const App = () => {
  return (

    <Router>
      <Navbar />
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/series/:id" element={<SeriesDetailsPage />} />
          <Route path="/videos/:id" element={<VideoDetailPage />} />
      </Routes>
    </div>
    </Router >
  );
};

export default App;