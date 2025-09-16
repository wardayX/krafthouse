import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        console.log('✅ Login successful');
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        console.log('✅ Google login successful');
        navigate('/dashboard');
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8f9fa',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '2.2rem', 
            fontWeight: 'bold'
          }}>
            🎨 KraftHouse
          </h1>
          <p style={{ 
            margin: 0, 
            opacity: 0.9, 
            fontSize: '1rem' 
          }}>
            Welcome back, artisan!
          </p>
        </div>

        {/* Form Container */}
        <div style={{ padding: '2rem' }}>
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#fff',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              padding: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
              transition: 'all 0.3s ease',
              color: '#333'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#4ecdc4';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#fff';
                e.target.style.borderColor = '#e0e0e0';
              }
            }}
          >
            {loading ? '⏳ Signing in...' : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ 
            position: 'relative', 
            textAlign: 'center', 
            marginBottom: '2rem' 
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: 0, 
              right: 0, 
              height: '1px', 
              backgroundColor: '#e0e0e0' 
            }}></div>
            <span style={{ 
              backgroundColor: 'white', 
              padding: '0 1rem', 
              color: '#666', 
              fontSize: '0.9rem' 
            }}>
              or sign in with email
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold', 
                color: '#333',
                fontSize: '0.9rem'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4ecdc4'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold', 
                color: '#333',
                fontSize: '0.9rem'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4ecdc4'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#ccc' : '#4ecdc4',
                color: 'white',
                border: 'none',
                padding: '1rem 1.5rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '🔄 Signing In...' : '🚀 Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem',
            padding: '1rem 0',
            borderTop: '1px solid #f0f0f0'
          }}>
            <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                style={{ 
                  color: '#4ecdc4', 
                  fontWeight: 'bold', 
                  textDecoration: 'none'
                }}
              >
                Create account here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
