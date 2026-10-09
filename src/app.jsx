import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <div className="body">
      <header className="site-header">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/BYU_Cougars_logo.svg/330px-BYU_Cougars_logo.svg.png" alt="BYU Cougars logo" />
        <div>
          <h1>CougarGrub</h1>
          <p className="tagline">Free food, shared by Cougars, for Cougars.</p>
        </div>
      </header>

      <main className="container">Page content will go here.</main>

      <footer className="site-footer">
        <p>&copy; 2026 CougarGrub. A BYU CS 260 startup project by James Eddington.</p>
        <p>
          <a href="https://github.com/jamesse0/StartupIdea">View on GitHub</a>
        </p>
      </footer>
    </div>
  );
}
