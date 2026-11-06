import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Home } from './home/home';
import { Listings } from './listings/listings';
import { PostEvent } from './postEvent/postEvent';
import { onUnauthorized } from './eventService';

export default function App() {
  // The cached name lets the page render right away; the server check below has the final say
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const [sessionExpired, setSessionExpired] = React.useState(false);

  function handleAuthChange(newUserName) {
    if (newUserName) {
      localStorage.setItem('userName', newUserName);
      setSessionExpired(false);
    } else {
      localStorage.removeItem('userName');
    }
    setUserName(newUserName);
  }

  // If any events request comes back 401, the session is gone: log out locally and let the
  // route guards send the user to the login page with a note explaining why
  React.useEffect(() => {
    onUnauthorized(() => {
      handleAuthChange('');
      setSessionExpired(true);
    });
    return () => onUnauthorized(null);
  }, []);

  // On load, ask the server who's logged in so a stale cached name (expired token, server restart) gets cleared
  React.useEffect(() => {
    fetch('/api/user/me')
      .then(async (response) => {
        if (response.ok) {
          const { userName: serverName } = await response.json();
          handleAuthChange(serverName);
        } else if (response.status === 401) {
          handleAuthChange('');
        }
      })
      // If the server can't be reached, keep the cached name rather than logging the user out
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'DELETE' });
    } catch {
      // Still clear the local login even if the server can't be reached
    }
    handleAuthChange('');
  }

  return (
    <BrowserRouter>
      <div className="body">
        <header className="site-header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/BYU_Cougars_logo.svg/330px-BYU_Cougars_logo.svg.png" alt="BYU Cougars logo" />
          <div>
            <h1>CougarGrub</h1>
            <p className="tagline">Free food, shared by Cougars, for Cougars.</p>
            {userName && <p className="header-user">Hi, {userName}!</p>}
          </div>
        </header>

        <nav className="site-nav">
          <ul className="nav justify-content-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Login
              </NavLink>
            </li>
            {userName && (
              <>
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
              </>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Login userName={userName} sessionExpired={sessionExpired} onAuthChange={handleAuthChange} onLogout={handleLogout} />} />
          <Route path="/home" element={userName ? <Home userName={userName} /> : <Navigate to="/" replace />} />
          <Route path="/listings" element={userName ? <Listings userName={userName} /> : <Navigate to="/" replace />} />
          <Route path="/post" element={userName ? <PostEvent userName={userName} /> : <Navigate to="/" replace />} />
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
