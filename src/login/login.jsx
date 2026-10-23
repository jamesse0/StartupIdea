import React from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}

export function Login({ userName, onAuthChange }) {
  const navigate = useNavigate();
  const [loginName, setLoginName] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [codeInput, setCodeInput] = React.useState('');
  const [verifyError, setVerifyError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [loginError, setLoginError] = React.useState('');

  const isByuEmail = email.trim().toLowerCase().endsWith('@byu.edu');
  const canSubmit = loginName && loginPassword && (!isCreating || isByuEmail);

  function handleSubmit(e) {
    e.preventDefault();
    if (isCreating) {
      const taken = Object.keys(getUsers()).some((name) => name.toLowerCase() === loginName.trim().toLowerCase());
      if (taken) {
        setUsernameError('That username is already taken. Pick another, or log in instead.');
        return;
      }
      setVerificationCode(String(Math.floor(100000 + Math.random() * 900000)));
    } else {
      const users = getUsers();
      const match = Object.keys(users).find((name) => name.toLowerCase() === loginName.trim().toLowerCase());
      if (!match || users[match].password !== loginPassword) {
        setLoginError('Incorrect username or password.');
        return;
      }
      onAuthChange(match);
      navigate('/home');
    }
  }

  function handleVerify(e) {
    e.preventDefault();
    if (codeInput !== verificationCode) {
      setVerifyError("That code doesn't match. Try again.");
      return;
    }
    // Mock: plain-text passwords in localStorage until the Service deliverable moves this to the server with BCrypt
    const users = getUsers();
    users[loginName] = { email: email.trim().toLowerCase(), password: loginPassword };
    localStorage.setItem('users', JSON.stringify(users));

    setVerificationCode('');
    setCodeInput('');
    setIsCreating(false);
    setSuccessMessage('Account created! Log in below.');
  }

  function cancelVerify() {
    setVerificationCode('');
    setCodeInput('');
    setVerifyError('');
  }

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
        {verificationCode ? (
          <>
            <h2>Verify your email</h2>
            <p>We sent a 6-digit code to <strong>{email.trim()}</strong>.</p>
            {/* Mock: the Service deliverable will email this code instead of showing it */}
            <p className="demo-note">Demo mode: email isn't hooked up yet, so your code is <strong>{verificationCode}</strong>.</p>
            <form onSubmit={handleVerify}>
              <label htmlFor="verify-code" className="form-label">Verification Code</label>
              <input type="text" id="verify-code" className="form-control code-input" inputMode="numeric" maxLength={6} placeholder="000000" value={codeInput} onChange={(e) => { setCodeInput(e.target.value.replace(/\D/g, '')); setVerifyError(''); }} />
              {verifyError && <p className="field-hint">{verifyError}</p>}

              <div className="button-row">
                <button type="submit" className="btn btn-cougar" disabled={codeInput.length !== 6}>Verify</button>
                <button type="button" className="btn btn-cougar-outline" onClick={cancelVerify}>Back</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2>{isCreating ? 'Create an Account' : 'Login'}</h2>
            {successMessage && <p className="success-note">{successMessage}</p>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="login-username" className="form-label">Username</label>
              <input type="text" id="login-username" className="form-control" name="username" placeholder="Enter your username" required value={loginName} onChange={(e) => { setLoginName(e.target.value); setUsernameError(''); setLoginError(''); }} />
              {usernameError && <p className="field-hint">{usernameError}</p>}

              {isCreating && (
                <>
                  <label htmlFor="register-email" className="form-label">BYU Email</label>
                  <input type="email" id="register-email" className="form-control" name="email" placeholder="you@byu.edu" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  {email && !isByuEmail && <p className="field-hint">Must be a @byu.edu email.</p>}
                </>
              )}

              <label htmlFor="login-password" className="form-label">Password</label>
              <input type="password" id="login-password" className="form-control" name="password" placeholder="Enter your password" required value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }} />
              {loginError && <p className="field-hint">{loginError}</p>}

              <div className="button-row">
                <button type="submit" className="btn btn-cougar" disabled={!canSubmit}>
                  {isCreating ? 'Create Account' : 'Login'}
                </button>
                <button type="button" className="btn btn-cougar-outline" onClick={() => { setIsCreating(!isCreating); setSuccessMessage(''); setUsernameError(''); setLoginError(''); }}>
                  {isCreating ? 'Back to login' : 'Create an account'}
                </button>
              </div>
            </form>
          </>
        )}
        {/* Application data placeholder: once authenticated, the logged-in user's name will render here */}
        <p className="login-status">Currently logged in as: <span id="current-username">{userName || 'nobody yet'}</span></p>
      </section>
    </main>
  );
}
