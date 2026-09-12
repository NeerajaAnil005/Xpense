import React from 'react';
import Modal from './Modal';
import { Sparkles, CheckCircle, AlertTriangle, TrendingUp, Lightbulb, Target, ShieldCheck } from 'lucide-react';

export default function AIReportModal({ isOpen, onClose, reportData, loading }) {
  if (!isOpen) return null;

  const report = reportData?.insights?.monthlyReport;
  const health = reportData?.insights?.financialHealth;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✨ Monthly AI Financial Report"
      maxWidth="720px"
    >
      {loading ? (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--ai-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            animation: 'pulse 1.5s infinite'
          }}>
            <Sparkles size={28} />
          </div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Analyzing your spending data...
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
            Google Gemini AI is evaluating your income, expenses, and category budget usage to generate personalized insights.
          </p>
        </div>
      ) : !report ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Could not load AI report. Please try again.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Health Badge Banner */}
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: health?.status === 'Healthy' ? 'var(--income-bg)' : health?.status === 'Moderate' ? 'var(--warning-bg)' : 'var(--expense-bg)',
            border: `1px solid ${health?.status === 'Healthy' ? 'var(--income-green)' : health?.status === 'Moderate' ? 'var(--warning-amber)' : 'var(--expense-red)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              padding: '0.5rem',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-card)',
              color: health?.status === 'Healthy' ? 'var(--income-green)' : health?.status === 'Moderate' ? 'var(--warning-amber)' : 'var(--expense-red)'
            }}>
              {health?.status === 'Healthy' ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                Financial Status: {health?.status || 'Active'}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {health?.reason || report.overallObservation}
              </div>
            </div>
          </div>

          {/* Key Metric Summaries Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Income</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--income-green)', marginTop: '0.25rem' }}>
                {report.incomeSummary}
              </div>
            </div>
            <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Expenses</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--expense-red)', marginTop: '0.25rem' }}>
                {report.expenseSummary}
              </div>
            </div>
            <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Savings</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
                {report.savingsSummary}
              </div>
            </div>
          </div>

          {/* Top Spending Categories & Unusual Spending */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                <TrendingUp size={16} color="var(--primary)" /> Top Spending Categories
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {report.topCategories?.map((cat, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{cat}</li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                <AlertTriangle size={16} color="var(--warning-amber)" /> Unusual / High Spending
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {report.unusualSpending}
              </p>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--ai-purple-light)', borderColor: 'var(--ai-purple)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--ai-purple)', marginBottom: '0.5rem' }}>
              <Lightbulb size={18} /> Actionable Financial Recommendations
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {report.recommendations?.map((rec, idx) => (
                <li key={idx}><strong>{rec}</strong></li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
              🖨️ Print / Save PDF Report
            </button>
          </div>

          {/* Disclaimer */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', marginTop: '0.5rem' }}>
            💡 AI-generated insights are for informational purposes only and are not professional financial advice.
          </div>
        </div>
      )}
    </Modal>
  );
}
