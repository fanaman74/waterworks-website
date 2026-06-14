import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { Eyebrow } from './Shared';
import { supabase } from '../supabase';

export default function VisitorAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const dialogRef = useRef(null);
  const [step, setStep] = useState(1);
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

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) onClose();
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
      setMessage('Verification code sent! Please check your email.');
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

        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Eyebrow>Welcome to WaterWorks</Eyebrow>
              <h3 style={{ marginTop: 8, fontSize: 24 }}>Sign In / Sign Up</h3>
            </div>
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
