import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { Eyebrow } from './Shared';
import { supabase } from '../supabase';

export default function VisitorAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const dialogRef = useRef(null);

  const [tab, setTab] = useState('signin');

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [createMessage, setCreateMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      resetAll();
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  function resetAll() {
    setTab('signin');
    setStep(1);
    setEmail('');
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setCreateMessage('');
    setLoading(false);
  }

  function switchTab(t) {
    setTab(t);
    setStep(1);
    setCode('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setCreateMessage('');
  }

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) onClose();
  };

  const handleGoogle = async () => {
    onClose();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true }
    });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
    } else {
      setStep(2);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length < 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    setLoading(true);
    setError('');
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email'
    });
    setLoading(false);
    if (verifyError) {
      setError('Invalid or expired code. Please try again.');
    } else {
      const user = data.user;
      setStep(3);
      onAuthSuccess({ email: user.email, name: user.email.split('@')[0], provider: 'email' });
      setTimeout(() => onClose(), 1500);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setCreateMessage('Account created! Check your email to confirm before signing in.');
    }
  };

  const showTopControls = tab === 'signin' ? step === 1 : !createMessage;

  return (
    <dialog
      ref={dialogRef}
      className="auth-modal"
      onClick={handleBackdropClick}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
    >
      <div className="auth-modal-content">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close dialog">
          <Icon name="close" size={16} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Eyebrow>Welcome to WaterWorks</Eyebrow>
          <h3 style={{ marginTop: 8, fontSize: 24 }}>
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </h3>
        </div>

        {showTopControls && (
          <>
            <button
              onClick={handleGoogle}
              className="btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 20,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--fg)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {['signin', 'create'].map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    border: 'none',
                    borderRadius: 0,
                    background: tab === t ? 'var(--primary)' : 'transparent',
                    color: tab === t ? '#fff' : 'var(--muted)',
                    fontWeight: tab === t ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: 14,
                    transition: 'background 0.15s'
                  }}
                >
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          </>
        )}

        {tab === 'signin' && (
          <>
            {step === 1 && (
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
            )}

            {step === 2 && (
              <div>
                <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16, textAlign: 'center' }}>
                  We sent a code to <strong>{email}</strong>
                </p>
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
                <p style={{ color: 'var(--muted)', marginTop: 8 }}>Welcome to WaterWorks!</p>
              </div>
            )}
          </>
        )}

        {tab === 'create' && (
          <>
            {!createMessage ? (
              <form onSubmit={handleCreateAccount}>
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
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a password"
                    required
                  />
                </div>
                <div className="field">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                  />
                </div>
                {error && <p style={{ color: 'var(--accent)', fontSize: 13, marginTop: -8, marginBottom: 12 }}>{error}</p>}
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            ) : (
              <div className="success" style={{ padding: '20px 0' }}>
                <div className="ok">
                  <Icon name="check" size={34} />
                </div>
                <h3 style={{ fontSize: 22 }}>Check your email</h3>
                <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14 }}>{createMessage}</p>
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
