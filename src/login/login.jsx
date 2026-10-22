import React from 'react';
import './login.css';

export function Login({ userName, onAuthChange }) {
  const [loginName, setLoginName] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  const isByuEmail = email.trim().toLowerCase().endsWith('@byu.edu');
  const canSubmit = loginName && loginPassword && (!isCreating || isByuEmail);

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
        <p>Login below, or create an account with your BYU email.</p>
      </section>

      <section id="login" className="card-panel">
        <h2>{isCreating ? 'Create an Account' : 'Login'}</h2>
        <form action="#" method="post">
          <label htmlFor="login-username" className="form-label">Username</label>
          <input type="text" id="login-username" className="form-control" name="username" placeholder="Enter your username" required value={loginName} onChange={(e) => setLoginName(e.target.value)} />

          {isCreating && (
            <>
              <label htmlFor="register-email" className="form-label">BYU Email</label>
              <input type="email" id="register-email" className="form-control" name="email" placeholder="you@byu.edu" required value={email} onChange={(e) => setEmail(e.target.value)} />
              {email && !isByuEmail && <p className="field-hint">Must be a @byu.edu email.</p>}
            </>
          )}

          <label htmlFor="login-password" className="form-label">Password</label>
          <input type="password" id="login-password" className="form-control" name="password" placeholder="Enter your password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />

          <div className="button-row">
            <button type="submit" className="btn btn-cougar" disabled={!canSubmit}>
              {isCreating ? 'Create Account' : 'Login'}
            </button>
            <button type="button" className="btn btn-cougar-outline" onClick={() => setIsCreating(!isCreating)}>
              {isCreating ? 'Back to login' : 'Create an account'}
            </button>
          </div>
        </form>
        {/* Application data placeholder: once authenticated, the logged-in user's name will render here */}
        <p className="login-status">Currently logged in as: <span id="current-username">{userName || 'nobody yet'}</span></p>
      </section>
    </main>
  );
}
