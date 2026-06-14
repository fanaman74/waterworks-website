import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { Eyebrow } from './Shared';

export default function VisitorAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const dialogRef = useRef(null);
  const [step, setStep] = useState(1); // 1 = Option selection, 2 = OTP check, 3 = Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setStep(1);
      setEmail('');
      setCode('');
      setError('');
      setMessage('');
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Fallback backdrop click dismissal for Safari
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleSendCode = (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    fetch('/api/visitor/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to request verification code');
      return res.json();
    })
    .then(data => {
      setStep(2);
      setMessage('Verification code sent! Please check your email.');
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');
    fetch('/api/visitor/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), code: code.trim() })
    })
    .then(res => {
      if (!res.ok) throw new Error('Invalid or expired code. Please try again.');
      return res.json();
    })
    .then(data => {
      setStep(3);
      onAuthSuccess(data.user, data.token);
      setTimeout(() => {
        onClose();
      }, 1500);
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
  };

  const handleGoogleSignIn = () => {
    setError('');
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      '/mock-google-login.html',
      'GoogleLogin',
      `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
    );
  };

  return (
    <dialog 
      ref={dialogRef} 
      className="auth-modal" 
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="auth-modal-content">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" size={16} />
        </button>

        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Eyebrow>Welcome to WaterWorks</Eyebrow>
              <h3 style={{ marginTop: 8, fontSize: 24 }}>Sign In / Sign Up</h3>
            </div>

            <button className="google-btn" onClick={handleGoogleSignIn}>
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <div className="auth-divider">or use email</div>

            <form onSubmit={handleSendCode}>
              <div className="field">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              {error && <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>{error}</p>}
              <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending code...' : 'Send Magic Verification Code'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Eyebrow>Check your email</Eyebrow>
              <h3 style={{ marginTop: 8, fontSize: 24 }}>Verify your email</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>We sent a code to <strong>{email}</strong></p>
            </div>

            <form onSubmit={handleVerifyCode}>
              <div className="field">
                <label>6-Digit Verification Code</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: 22, letterSpacing: '0.2em' }}
                  required
                />
              </div>
              {error && <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>{error}</p>}
              {message && <p style={{ color: 'var(--primary)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>{message}</p>}
              <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 13.5 }}>
              <button 
                className="btn btn-ghost" 
                style={{ border: 'none', background: 'transparent', color: 'var(--primary)', padding: 0 }}
                onClick={() => setStep(1)}
              >
                Change Email
              </button>
              <button 
                className="btn btn-ghost" 
                style={{ border: 'none', background: 'transparent', color: 'var(--muted)', padding: 0 }}
                onClick={() => handleSendCode(null)}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="success" style={{ padding: '20px 0' }}>
            <div className="ok">
              <Icon name="check" size={34} />
            </div>
            <h3 style={{ fontSize: 24 }}>Successfully Signed In</h3>
            <p style={{ color: 'var(--muted)', marginTop: 8 }}>Welcome back to WaterWorks!</p>
          </div>
        )}
      </div>
    </dialog>
  );
}
