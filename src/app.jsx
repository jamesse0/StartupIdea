import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Home } from './home/home';
import { Listings } from './listings/listings';
import { PostEvent } from './postEvent/postEvent';

export default function App() {
  return (
    <BrowserRouter>
      <div className="body">
        <header className="site-header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/BYU_Cougars_logo.svg/330px-BYU_Cougars_logo.svg.png" alt="BYU Cougars logo" />
          <div>
            <h1>CougarGrub</h1>
            <p className="tagline">Free food, shared by Cougars, for Cougars.</p>
          </div>
        </header>

        <nav className="site-nav">
          <ul className="nav justify-content-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Login
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/home">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/listings">
                Current Listings
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/post">
                Post an Event
              </NavLink>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/post" element={<PostEvent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <footer className="site-footer">
          <p>&copy; 2026 CougarGrub. A BYU CS 260 startup project by James Eddington.</p>
          <p>
            <a href="https://github.com/jamesse0/StartupIdea">View on GitHub</a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className="container text-center">404: This page is not on the menu.</main>;
}
