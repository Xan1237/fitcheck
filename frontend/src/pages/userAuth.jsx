import React, { useState } from 'react';
import './SignIn.scss';
import { FaDumbbell } from "react-icons/fa";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!email || !password || !confirmPassword) {
      throw new Error('All fields are required');
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords don't match!");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        window.location.href = "/profile";
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
        
        window.location.href = "/";
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
    setConfirmPassword('');
    setRememberMe(false);
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
            
            {isSignUp && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

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

            {!isSignUp && (
              <>
                <div className="signin-divider">
                  <span>OR</span>
                </div>

                <button type="button" className="social-signin-button">
                  <i className="icon-google"></i>
                  Continue with Google
                </button>
              </>
            )}

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