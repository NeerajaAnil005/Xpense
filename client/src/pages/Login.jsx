import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Step 1: Validate email
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    // Step 2: Validate password
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    // Step 3: Only after client validation passes, trigger loading state
    setLoading(true);

    try {
      // Step 4: Send credentials to the existing login API endpoint
      const res = await login(email.trim(), password);
      
      // Step 5: On success, token & user state are saved via AuthContext, navigate to Dashboard
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setError(res?.message || 'Invalid email or password.');
      }
    } catch (err) {
      // Step 6: On failed login, display clear error message
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      // Step 7: Always stop the spinner and re-enable button
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        padding: '2.5rem 2rem'
      }}>
        {/* Xpense Logo & Name */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '3.25rem',
            height: '3.25rem',
            borderRadius: '0.875rem',
            background: 'linear-gradient(135deg, var(--primary), var(--ai-purple))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.625rem',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '1rem'
          }}>
            X
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
            Sign in to your account to continue.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--expense-bg)',
            color: 'var(--expense-red)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textAlign: 'center',
            border: '1px solid var(--expense-red)'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form noValidate onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email</label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem 1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={18} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Register Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
