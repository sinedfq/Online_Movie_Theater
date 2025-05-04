import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from './logo.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
        <img src={logo} alt="Логотип" className='logoIm' />
        </Link>
        
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/favorites" className="navbar-link">
              Избранное
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link">
              О нас
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;