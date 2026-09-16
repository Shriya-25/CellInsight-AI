import { useState } from 'react';
import './Login.css';
import loginLeftImg from './assets/login-left.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (e) => {
    e.preventDefault();
    onLoginSuccess('demo-token-123', { name: 'Demo Pathologist', role: 'doctor/pathologist' });
  };

  return (
    <div className="login-page">
      {/* Main Container: Full Viewport Split Screen */}
      <div className="login-split">
        {/* LEFT SIDE: Image panel provided by user */}
        <div 
          className="login-left" 
          data-purpose="branding-panel" 
          style={{ 
            background: `#f8faff url(${loginLeftImg}) center / contain no-repeat`,
            padding: 0 
          }}
        >
        </div>

        {/* RIGHT SIDE: Balanced Authentication Pane */}
        <div className="login-right" data-purpose="auth-panel">
          {/* Top Right Ambient Status Badge */}
          <div className="top-badge" data-purpose="top-navigation-status">
            <div className="badge-inner">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Research Prototype</span>
            </div>
          </div>

          {/* Vertically & Horizontally Centered Login Card */}
          <div className="login-card-container">
            <div className="login-card" data-purpose="login-form-card">
              {/* Card Header */}
              <div className="card-header">
                <h2>Welcome Back</h2>
                <p>Sign in to access your CellInsight Lab account.</p>
              </div>

              {/* Single Authentication Form */}
              <form className="login-form-inner" onSubmit={handleLogin}>
                {error && <div className="error-msg">{error}</div>}

                {/* Email / User ID Input */}
                <div className="input-group" data-purpose="input-email-container">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      className="input-field"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input with Masking & Eye Toggle */}
                <div className="input-group" data-purpose="input-password-container">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      className="input-field"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    {/* Eye Icon Toggle */}
                    <button
                      aria-label="Toggle password visibility"
                      className="toggle-pwd"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="form-options">
                  <label className="remember-me">
                    <input defaultChecked type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a className="forgot-pwd" href="#">Forgot password?</a>
                </div>

                {/* Primary CTA Button */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className="btn-submit"
                    disabled={loading}
                    type="submit"
                    style={{ flex: 1 }}
                  >
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                  
                  <button
                    className="btn-submit"
                    type="button"
                    onClick={handleDemoLogin}
                    style={{ flex: 1, backgroundColor: '#565e74' }}
                    title="Bypass login for UI testing"
                  >
                    <span>Demo Mode</span>
                  </button>
                </div>
              </form>

              {/* Card Footer Legal Text */}
              <div className="legal-text">
                <p>
                  By signing in, you agree to our{' '}
                  <a href="#">Privacy Policy</a> and{' '}
                  <a href="#">Terms of Use</a>.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Right Ambient Watermark */}
          <footer className="bottom-branding" data-purpose="bottom-branding">
            <div className="bottom-branding-inner">
              <div className="branding-line"></div>
              <span className="branding-text">For A Clearer Tomorrow</span>
              <div className="branding-svg">
                <svg fill="none" strokeLinecap="round" strokeWidth="2" viewBox="0 0 60 40">
                  <line x1="12" x2="32" y1="28" y2="18"></line>
                  <line x1="32" x2="52" y1="18" y2="28"></line>
                  <line x1="32" x2="32" y1="18" y2="4"></line>
                  <circle cx="12" cy="28" fill="#eff6fc" r="4" stroke="#b4d5f7" strokeWidth="2"></circle>
                  <circle cx="52" cy="28" fill="#eff6fc" r="4" stroke="#b4d5f7" strokeWidth="2"></circle>
                  <circle cx="32" cy="18" fill="#ddecfa" r="4.5" stroke="#8ec1f4" strokeWidth="2.2"></circle>
                  <circle cx="32" cy="4" fill="#eff6fc" r="3.5" stroke="#b4d5f7" strokeWidth="2"></circle>
                </svg>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
