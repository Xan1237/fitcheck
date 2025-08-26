import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SignIn.scss';
import { FaDumbbell } from "react-icons/fa";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  // Extract and validate token from hash if present (for Google sign-in)
  useEffect(() => {
    const validateAndSaveToken = async () => {
      const params = new URLSearchParams(window.location.hash.replace('#', ''));
      const token = params.get('access_token');
      const provider = params.get('provider_token');
      
      // Only process if it's a Google sign-in
      if (token && (provider || window.location.search.includes('provider=google'))) {
        try {
          // Validate the token with our backend
          const response = await axios.post(`${API_BASE_URL}/auth/validate-google-token`, {
            token,
            provider_token: provider
          });

          if (response.data.success) {
            // Save the validated token from our backend
            localStorage.setItem('token', response.data.token);
            window.location.hash = '';
            window.location.href = '/';
          } else {
            setError('Failed to validate Google sign-in');
          }
        } catch (error) {
          console.error('Google sign-in validation error:', error);
          setError('Failed to validate Google sign-in');
        }
      }
    };

    validateAndSaveToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Validate inputs
    if (!email || !password || !username) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        username
      });

      if (response.data.success) {
        setConfirmationMessage("Please check your email and verify your account before signing in.");
        setIsSignUp(false);  // Switch to login form
        setEmail('');  // Clear the form
        setPassword('');
        setUsername('');
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Signup failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        
        // Set expiration if rememberMe is checked (7 days)
        if (rememberMe) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
          localStorage.setItem('expiresAt', expiresAt.toISOString());
        }
        
        // Redirect to the intended page or default to home
        const { from } = location.state || { from: '/' };
        navigate(from, { replace: true });
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
    setRememberMe(false);
  };

  // Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google
  const handleGoogleAuth = () => {
    if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
      setError('Google sign-in is not configured. Please contact support.');
      return;
    }
    window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(REDIRECT_URL)}`;
    // Extract access_token from hash and save to localStorage
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const accessToken = hashParams.get('access_token');
    console.log('Access token from hash:', accessToken);
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-left">
          <div className="logo-container">
            <div className="logo">
              <FaDumbbell style={{ fontSize: "50px", color: "black" }} />
            </div>
          </div>
          <h2>{isSignUp ? 'Join FitCheck' : 'Login To Your FitCheck Account'}</h2>
          <p>Track, review, and discover the best gyms in your area</p>
        </div>
        
        <div className="signin-right">
          <div className="signin-header">
            <h1>{isSignUp ? 'Create an account' : 'Welcome back'}</h1>
            <p>{isSignUp ? 'Sign up to start using FitCheck' : 'Sign in to continue to FitCheck'}</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {confirmationMessage && (
            <div className="confirmation-message">
              {confirmationMessage}
            </div>
          )}
          {(!error && !loading && localStorage.getItem('token') && localStorage.getItem('username')) && (
            <div className="success-message">
              Login successful! Redirecting to your profile...
            </div>
          )}

          <form onSubmit={handleSubmit} className="signin-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={isSignUp ? 6 : undefined}
              />
            </div>

            {!isSignUp && (
              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <a href="#forgot-password" className="forgot-password">
                  Forgot password?
                </a>
              </div>
            )}

            <button 
              type="submit" 
              className="signin-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            <div className="signin-divider">
              <span>OR</span>
            </div>
            <button 
              type="button" 
              className="social-signin-button"
              onClick={handleGoogleAuth}
            >
              <i className="icon-google"></i>
              Continue with Google
            </button>

            <div className="auth-toggle-link">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;