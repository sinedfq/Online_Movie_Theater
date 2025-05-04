import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import MovieDetailPage from './pages/MovieDetailPage/MovieDetailPage';
import Navbar from './components/NavBar/NavBar';
import './App.css';

const App = () => {
  return (
    
    <Router>
      <Navbar />
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;