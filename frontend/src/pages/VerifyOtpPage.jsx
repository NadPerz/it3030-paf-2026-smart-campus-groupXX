import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import axios from 'axios';

const RESEND_SECONDS = 180; // 3 minutes

function VerifyOtpPage() {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get('email');

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  // Handle individual digit input
  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError('');
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  // Handle paste (e.g. paste full 6-digit code)
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please fill in all 6 digits.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8080/api/auth/verify-otp', { email, code });
      const { token, status } = res.data;
      localStorage.setItem('token', token);
      const userResponse = await authService.getCurrentUser();
      const user = userResponse.data;
      login({ ...user, token });
      if (status === 'PENDING') navigate('/pending-approval');
      else if (status === 'SUSPENDED') navigate('/access-denied');
      else navigate('/');
    } catch {
      setError('Invalid or expired code. Please try again.');
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resendLoading) return;
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await axios.post('http://localhost:8080/api/auth/resend-otp', { email });
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(6).fill(''));
      setResendSuccess(true);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <style>{`
        html, body {
          overflow: hidden !important;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        .otp-page {
          height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
          overflow: hidden;
        }
        .otp-card {
          display: flex;
          width: 100%;
          max-width: 800px;
          height: 100%;
          max-height: 460px;
          border-radius: 12px;
          border: 1px solid #DDE3EC;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
        }
        .otp-photo {
          flex: 0 0 44%;
          overflow: hidden;
          position: relative;
        }
        .otp-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .otp-right {
          flex: 1;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 24px;
          gap: 0;
          min-width: 0;
        }
        .otp-inner {
          width: 100%;
          max-width: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .otp-digits {
          display: flex;
          gap: 8px;
          margin: 14px 0 10px;
        }
        .otp-digit {
          width: 40px;
          height: 48px;
          border: 1.5px solid #CBD5E1;
          border-radius: 8px;
          font-size: 20px;
          font-weight: 700;
          color: #111827;
          text-align: center;
          outline: none;
          background: #fff;
          font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
          transition: border-color 0.15s, box-shadow 0.15s;
          caret-color: transparent;
        }
        .otp-digit:focus {
          border-color: #1D4ED8;
          box-shadow: 0 0 0 3px rgba(29,78,216,0.12);
        }
        .otp-digit.filled {
          border-color: #1D4ED8;
          background: #F0F4FF;
        }
        .otp-continue-btn {
          width: 100%;
          height: 42px;
          background: #1D4ED8;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          margin-top: 14px;
          transition: background 0.15s, opacity 0.15s;
          letter-spacing: 0.01em;
        }
        .otp-continue-btn:hover:not(:disabled) { background: #1e40af; }
        .otp-continue-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .otp-back-btn {
          width: 100%;
          height: 38px;
          background: #F8FAFC;
          color: #374151;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s;
        }
        .otp-back-btn:hover { background: #F1F5F9; }
        @media (max-width: 580px) {
          .otp-photo { display: none; }
        }
      `}</style>

      <div className="otp-page">
        <div className="otp-card">

          {/* Left: same campus image */}
          <div className="otp-photo">
            <img
              src="https://images.unsplash.com/photo-1562774053-701939374585?w=900&auto=format&fit=crop&q=80"
              alt="University campus"
            />
          </div>

          {/* Right: OTP form */}
          <div className="otp-right">
            <div className="otp-inner">

              {/* Icon */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: '#EEF2FF', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '10px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="#1D4ED8" strokeWidth="1.8"/>
                  <path d="M16 7V5a4 4 0 0 0-8 0v2" stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="12" cy="14" r="2" fill="#1D4ED8"/>
                </svg>
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 5px', textAlign: 'center' }}>
                Enter OTP
              </h2>
              <p style={{ fontSize: '12.5px', color: '#6B7280', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                6-digit code sent to{' '}
                <span style={{ fontWeight: '600', color: '#374151' }}>{email}</span>
              </p>

              {/* Timer */}
              <p style={{
                fontSize: '12px',
                color: secondsLeft > 0 ? '#4B5563' : '#EF4444',
                margin: '8px 0 0',
                fontWeight: '500',
              }}>
                {secondsLeft > 0
                  ? `${formatTime(secondsLeft)} Minutes Remaining`
                  : 'Code expired'}
              </p>

              {/* Digit inputs */}
              <div className="otp-digits" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    className={`otp-digit${d ? ' filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: '#FEF2F2', border: '1px solid #FECACA',
                  borderRadius: '7px', padding: '7px 11px', color: '#991B1B',
                  width: '100%', boxSizing: 'border-box', marginBottom: '2px',
                }}>
                  <span>⚠️</span>
                  <span style={{ fontSize: '12px' }}>{error}</span>
                </div>
              )}

              {/* Resend success */}
              {resendSuccess && !error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: '#F0FDF4', border: '1px solid #BBF7D0',
                  borderRadius: '7px', padding: '7px 11px', color: '#166534',
                  width: '100%', boxSizing: 'border-box', marginBottom: '2px',
                }}>
                  <span>✅</span>
                  <span style={{ fontSize: '12px' }}>New code sent to your email.</span>
                </div>
              )}

              {/* Resend */}
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '6px 0 0', textAlign: 'center' }}>
                Didn't receive the code?{' '}
                <span
                  onClick={handleResend}
                  style={{
                    color: secondsLeft > 0 ? '#9CA3AF' : '#1D4ED8',
                    fontWeight: '600',
                    cursor: secondsLeft > 0 ? 'not-allowed' : 'pointer',
                    textDecoration: secondsLeft === 0 ? 'underline' : 'none',
                  }}
                >
                  {resendLoading ? 'Sending…' : 'Click to resend'}
                </span>
              </p>

              {/* Continue */}
              <button className="otp-continue-btn" onClick={handleVerify} disabled={loading || digits.join('').length !== 6}>
                {loading ? 'Verifying…' : 'Continue'}
              </button>

              {/* Back */}
              <button className="otp-back-btn" onClick={() => navigate('/login')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go Back to Sign In
              </button>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default VerifyOtpPage;