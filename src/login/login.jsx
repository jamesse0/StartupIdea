import React from 'react';
import './login.css';

export function Login({ userName, onAuthChange }) {
  return (
    <main className="container login-page">
      <section id="welcome">
        <h2>Welcome to CougarGrub</h2>
        <p>
          Food is a basic necessity for human life, and as a college student, it can be
          quite scarce. Fortunately, BYU's campus can be a treasure trove of free food
          opportunities. CougarGrub enables students not only to capitalize on these
          opportunities, but share with others.
        </p>
        <p>Login or create an account below to start posting and viewing free food events.</p>
      </section>

      <section id="login" className="card-panel">
        <h2>Login</h2>
        <form action="#" method="post">
          <label htmlFor="login-username" className="form-label">Username</label>
          <input type="text" id="login-username" className="form-control" name="username" placeholder="Enter your username" required />

          <label htmlFor="login-password" className="form-label">Password</label>
          <input type="password" id="login-password" className="form-control" name="password" placeholder="Enter your password" required />

          <button type="submit" className="btn btn-cougar">Login</button>
        </form>
        {/* Application data placeholder: once authenticated, the logged-in user's name will render here */}
        <p className="login-status">Currently logged in as: <span id="current-username">{userName || 'nobody yet'}</span></p>
      </section>

      <section id="register" className="card-panel">
        <h2>Create an Account</h2>
        <form action="#" method="post">
          <label htmlFor="register-username" className="form-label">Username</label>
          <input type="text" id="register-username" className="form-control" name="username" placeholder="Choose a username" required />

          <label htmlFor="register-email" className="form-label">Email</label>
          <input type="email" id="register-email" className="form-control" name="email" placeholder="you@byu.edu" required />

          <label htmlFor="register-password" className="form-label">Password</label>
          <input type="password" id="register-password" className="form-control" name="password" placeholder="Choose a password" required />

          <button type="submit" className="btn btn-cougar">Create Account</button>
        </form>
      </section>
    </main>
  );
}
