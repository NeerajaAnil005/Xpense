import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Moon, Sun, DollarSign, Bell, Shield, Save, Check } from 'lucide-react';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCurrency(user.currency || 'INR');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const res = await updateProfile({ name, email, currency, theme });
      if (res.success) {
        setMessage('Profile and application settings updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Account & Application Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage your personal user profile, currency preference, and light/dark theme options.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--income-bg)',
          color: 'var(--income-green)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Check size={18} /> {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--expense-bg)',
          color: 'var(--expense-red)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Details Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <User size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Profile Information</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Financial Preferences Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <DollarSign size={20} color="var(--income-green)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Financial Preferences</h3>
          </div>

          <div className="form-group" style={{ maxWidth: '320px' }}>
            <label className="form-label">Default Currency Symbol</label>
            <select
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">INR (₹) - Indian Rupee (Default)</option>
              <option value="USD">USD ($) - US Dollar</option>
            </select>
          </div>
        </div>

        {/* Theme Settings Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Sun size={20} color="var(--warning-amber)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Theme Mode</h3>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              style={{
                flex: '1 1 200px',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border-color)'}`,
                backgroundColor: theme === 'light' ? 'var(--primary-light)' : 'var(--bg-primary)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <Sun size={24} color="var(--warning-amber)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>Light Mode</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crisp white UI layout</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              style={{
                flex: '1 1 200px',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border-color)'}`,
                backgroundColor: theme === 'dark' ? 'var(--primary-light)' : 'var(--bg-primary)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <Moon size={24} color="var(--ai-purple)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem' }}>Dark Mode</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sleek dark theme</div>
              </div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} /> {saving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
