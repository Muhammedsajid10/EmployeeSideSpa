import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!credentials.username || !credentials.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(credentials);
      
      if (!result.success) {
        setError(result.error);
      }
      // If successful, the AuthContext will handle the redirect
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-avatar">
            <User className="login-avatar-icon" />
          </div>
          <h1 className="login-title">Employee Portal</h1>
          <p className="login-subtitle">Sign in to access your employee dashboard</p>
        </div>
        
        <div className="login-content">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Email</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  id="username"
                  name="username"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.username}
                  onChange={handleChange}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="form-input password-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="demo-credentials">
            <p className="demo-title">Demo Employee Credentials:</p>
            <p className="demo-item">Email: <span className="demo-value">sarah.johnson@spa.com</span></p>
            <p className="demo-item">Password: <span className="demo-value">Employee@123</span></p>
            <p className="demo-note">Note: All employees use the same password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

