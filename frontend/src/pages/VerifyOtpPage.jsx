import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import axios from 'axios';

function VerifyOtpPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const email = searchParams.get('email');

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8080/api/auth/verify-otp', {
        email,
        code,
      });

      const { token, status } = res.data;
      localStorage.setItem('token', token);

      const userResponse = await authService.getCurrentUser();
      const user = userResponse.data;
      login({ ...user, token });

      if (status === 'PENDING') {
        navigate('/pending-approval');
      } else if (status === 'SUSPENDED') {
        navigate('/access-denied');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '16px',
    }}>
      <h2>Two-Factor Verification</h2>
      <p style={{ color: '#555' }}>
        A 6-digit code was sent to <strong>{email}</strong>
      </p>
      <input
        type="text"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        placeholder="Enter 6-digit code"
        style={{
          fontSize: '1.5rem',
          letterSpacing: '0.5rem',
          textAlign: 'center',
          padding: '12px 20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          width: '220px',
        }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button
        onClick={handleVerify}
        disabled={loading}
        style={{
          padding: '10px 32px',
          fontSize: '1rem',
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </div>
  );
}

export default VerifyOtpPage;