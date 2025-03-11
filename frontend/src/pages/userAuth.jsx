import React, { useState } from 'react';
import './SignIn.scss';
import { FaBars, FaTimes, FaDumbbell } from "react-icons/fa";
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
      async function signup(email, password) {
        try {
          const response = await fetch('/auth/signup', {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
        console.log(data)
        if (data.success) {
          // Store authentication data in localStorage
          if (data.token) {
            localStorage.setItem('token', data.token);
            console.log("Token stored:", data.token);
          } else {
            console.error("Token is undefined in the response");
          }
        }
        window.location.href = "/profile";
        console.log("Token stored:", data.token);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    signup(email, password);
    
    } else {
      async function signin(email, password) {
        try {
          const response = await fetch('/auth/signin', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          
          const data = await response.json();
          console.log("Response data:", data); // Add this line for debugging
          
          if (data.success) {
            // Store authentication data in localStorage
            if (data.token) {
              localStorage.setItem('token', data.token);
              console.log("Token stored:", data.token);
            } else {
              console.error("Token is undefined in the response");
            }
          
            
            // Redirect after successfully processing the data
            window.location.href = "/";
          } else {
            // Handle authentication failure
            console.error('Authentication failed:', data.message);
            // You might want to show an error message to the user here
          }
        } catch (error) {
          console.error('Error:', error);
          // Handle error - show message to user
        }
      }
      
      signin(email, password);
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
            <FaDumbbell style={{ fontSize: "50px", color: "black" }} />

            </div>
          </div>
          <h2>{isSignUp ? 'Join FitCheck' : 'Login To Your FitCheck Acount'}</h2>
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