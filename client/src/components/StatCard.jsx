import React from 'react';

export default function StatCard({ title, amount, currency = 'INR', icon: Icon, variant = 'primary', subtext }) {
  const symbol = currency === 'USD' ? '$' : '₹';
  const formattedAmount = `${symbol}${Number(amount || 0).toLocaleString('en-IN')}`;

  const variantStyles = {
    primary: {
      bg: 'var(--primary-light)',
      color: 'var(--primary)',
      border: 'var(--primary)'
    },
    income: {
      bg: 'var(--income-bg)',
      color: 'var(--income-green)',
      border: 'var(--income-green)'
    },
    expense: {
      bg: 'var(--expense-bg)',
      color: 'var(--expense-red)',
      border: 'var(--expense-red)'
    },
    warning: {
      bg: 'var(--warning-bg)',
      color: 'var(--warning-amber)',
      border: 'var(--warning-amber)'
    },
    ai: {
      bg: 'var(--ai-purple-light)',
      color: 'var(--ai-purple)',
      border: 'var(--ai-purple)'
    }
  };

  const style = variantStyles[variant] || variantStyles.primary;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: style.bg,
            color: style.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {formattedAmount}
        </div>
        {subtext && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
