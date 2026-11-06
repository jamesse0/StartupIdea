import React from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

// Sends JSON to the backend and always resolves with the status and parsed body (or {} if there isn't one)
async function sendJson(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

const SERVER_ERROR = "Couldn't reach CougarGrub right now. Try again in a moment.";

export function Login({ userName, onAuthChange }) {
  const navigate = useNavigate();
  const [loginName, setLoginName] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [pendingId, setPendingId] = React.useState('');
  const [demoCode, setDemoCode] = React.useState('');
  const [codeInput, setCodeInput] = React.useState('');
  const [verifyError, setVerifyError] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [loginError, setLoginError] = React.useState('');
  const [formError, setFormError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const isByuEmail = email.trim().toLowerCase().endsWith('@byu.edu');
  const canSubmit = loginName && loginPassword && (!isCreating || isByuEmail) && !busy;

  // A 409 from the server says whether the username or the email is the one already taken
  function showConflict(data) {
    if (data.field === 'email') {
      setEmailError(data.msg);
    } else {
      setUsernameError(data.msg);
    }
  }

  function finishLogin(name) {
    onAuthChange(name);
    navigate('/home');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setBusy(true);
    try {
      if (isCreating) {
        const { ok, status, data } = await sendJson('/api/auth/create', 'POST', {
          userName: loginName,
          email,
          password: loginPassword,
        });
        if (ok) {
          setPendingId(data.pendingId);
          setDemoCode(data.demoCode);
        } else if (status === 409) {
          showConflict(data);
        } else {
          setFormError(data.msg || SERVER_ERROR);
        }
      } else {
        const { ok, data } = await sendJson('/api/auth/login', 'PUT', {
          userName: loginName,
          password: loginPassword,
        });
        if (ok) {
          finishLogin(data.userName);
        } else {
          setLoginError(data.msg || SERVER_ERROR);
        }
      }
    } catch {
      setFormError(SERVER_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { ok, status, data } = await sendJson('/api/auth/verify', 'POST', { pendingId, code: codeInput });
      if (ok) {
        finishLogin(data.userName);
      } else if (status === 400) {
        setVerifyError(data.msg);
      } else {
        // Expired code, too many tries, or the name/email got taken: send them back to the signup form
        cancelVerify();
        if (status === 409) {
          showConflict(data);
        } else {
          setFormError(data.msg || SERVER_ERROR);
        }
      }
    } catch {
      setVerifyError(SERVER_ERROR);
    } finally {
      setBusy(false);
    }
  }

  function cancelVerify() {
    setPendingId('');
    setDemoCode('');
    setCodeInput('');
    setVerifyError('');
  }

  function toggleCreating() {
    setIsCreating(!isCreating);
    setUsernameError('');
    setEmailError('');
    setLoginError('');
    setFormError('');
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
        <p>{userName ? "Welcome back! Head home to see what's free on campus." : 'Login below, or create an account with your BYU email.'}</p>
      </section>

      <section id="login" className="card-panel">
        {userName ? (
          <>
            <h2>You're logged in</h2>
            <p>Logged in as <span id="current-username">{userName}</span>.</p>
            <div className="button-row">
              <button type="button" className="btn btn-cougar" onClick={() => navigate('/home')}>Go to Home</button>
              <button type="button" className="btn btn-cougar-outline" onClick={() => onAuthChange('')}>Logout</button>
            </div>
          </>
        ) : pendingId ? (
          <>
            <h2>Verify your email</h2>
            <p>We sent a 6-digit code to <strong>{email.trim()}</strong>.</p>
            {/* Demo mode: email isn't hooked up, so the server sends the code back for us to show */}
            <p className="demo-note">Demo mode: email isn't hooked up yet, so your code is <strong>{demoCode}</strong>.</p>
            <form onSubmit={handleVerify}>
              <label htmlFor="verify-code" className="form-label">Verification Code</label>
              <input type="text" id="verify-code" className="form-control code-input" inputMode="numeric" maxLength={6} placeholder="000000" value={codeInput} onChange={(e) => { setCodeInput(e.target.value.replace(/\D/g, '')); setVerifyError(''); }} />
              {verifyError && <p className="field-hint">{verifyError}</p>}

              <div className="button-row">
                <button type="submit" className="btn btn-cougar" disabled={codeInput.length !== 6 || busy}>Verify</button>
                <button type="button" className="btn btn-cougar-outline" onClick={cancelVerify}>Back</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2>{isCreating ? 'Create an Account' : 'Login'}</h2>
            {formError && <p className="field-hint">{formError}</p>}
            <form onSubmit={handleSubmit}>
              <label htmlFor="login-username" className="form-label">Username</label>
              <input type="text" id="login-username" className="form-control" name="username" placeholder="Enter your username" required value={loginName} onChange={(e) => { setLoginName(e.target.value); setUsernameError(''); setLoginError(''); }} />
              {usernameError && <p className="field-hint">{usernameError}</p>}

              {isCreating && (
                <>
                  <label htmlFor="register-email" className="form-label">BYU Email</label>
                  <input type="email" id="register-email" className="form-control" name="email" placeholder="you@byu.edu" required value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(''); }} />
                  {email && !isByuEmail && <p className="field-hint">Must be a @byu.edu email.</p>}
                  {emailError && <p className="field-hint">{emailError}</p>}
                </>
              )}

              <label htmlFor="login-password" className="form-label">Password</label>
              <input type="password" id="login-password" className="form-control" name="password" placeholder="Enter your password" required value={loginPassword} onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }} />
              {loginError && <p className="field-hint">{loginError}</p>}

              <div className="button-row">
                <button type="submit" className="btn btn-cougar" disabled={!canSubmit}>
                  {isCreating ? 'Create Account' : 'Login'}
                </button>
                <button type="button" className="btn btn-cougar-outline" onClick={toggleCreating}>
                  {isCreating ? 'Back to login' : 'Create an account'}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
