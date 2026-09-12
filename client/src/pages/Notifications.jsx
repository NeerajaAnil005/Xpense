import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, Trash2, AlertTriangle, Sparkles, Shield, Info } from 'lucide-react';

export default function Notifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'budget_exceeded':
        return { bg: 'var(--expense-bg)', color: 'var(--expense-red)', icon: AlertTriangle, label: 'Exceeded' };
      case 'budget_warning':
        return { bg: 'var(--warning-bg)', color: 'var(--warning-amber)', icon: AlertTriangle, label: 'Warning' };
      case 'ai':
        return { bg: 'var(--ai-purple-light)', color: 'var(--ai-purple)', icon: Sparkles, label: 'AI Insight' };
      default:
        return { bg: 'var(--primary-light)', color: 'var(--primary)', icon: Info, label: 'System' };
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Notifications Center
            </h1>
            {unreadCount > 0 && (
              <span className="badge badge-expense" style={{ fontSize: '0.75rem' }}>
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            System updates, automated budget threshold warnings, and new AI spending reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-secondary">
              <CheckCheck size={18} /> Mark All as Read
            </button>
          )}

          {notifications.length > 0 && (
            <button onClick={clearAll} className="btn btn-secondary" style={{ color: 'var(--expense-red)' }}>
              <Trash2 size={18} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              No Notifications Right Now
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              You will receive automatic alerts when budget usage reaches 80% or 100%, or when new AI insights are ready.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map(n => {
              const badge = getBadgeStyle(n.type);
              const Icon = badge.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: n.is_read ? 'transparent' : 'var(--primary-light)',
                    cursor: n.is_read ? 'default' : 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{
                      padding: '0.625rem',
                      borderRadius: '50%',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      shrink: 0,
                      marginTop: '2px'
                    }}>
                      <Icon size={20} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                          {n.title}
                        </span>
                        <span className="badge" style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.65rem' }}>
                          {badge.label}
                        </span>
                        {!n.is_read && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem', display: 'block' }}>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
