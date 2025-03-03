import React, { useState } from 'react';
import './SignIn.scss';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      console.log('Signing up with:', { email, password });
      // Add your sign-up logic here
    } else {
      console.log('Signing in with:', { email, password, rememberMe });
      // Add your sign-in logic here
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    // Reset form fields when switching modes
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
              <i className="icon-dumbbell"></i>
            </div>
          </div>
          <h2>{isSignUp ? 'Start your fitness journey' : 'Get back to your fitness journey'}</h2>
          <p>Track, review, and discover the best gyms in your area</p>
        </div>
        <div className="signin-right">
          <div className="signin-header">
            <h1>{isSignUp ? 'Create an account' : 'Welcome back'}</h1>
            <p>{isSignUp ? 'Sign up to start using GymReview' : 'Sign in to continue to GymReview'}</p>
          </div>

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

            <button type="submit" className="signin-button">
              {isSignUp ? 'Sign Up' : 'Sign In'}
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