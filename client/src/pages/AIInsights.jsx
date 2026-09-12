import React, { useState, useEffect } from 'react';
import { aiService } from '../services/api';
import AIReportModal from '../components/AIReportModal';
import { 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  Target, 
  PiggyBank, 
  ShieldCheck, 
  RefreshCw,
  Info
} from 'lucide-react';

export default function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiReportOpen, setAiReportOpen] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await aiService.getInsights();
      if (res.data.success) {
        setInsights(res.data.insights);
      }
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const health = insights?.financialHealth;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              AI Spending Insights
            </h1>
            <span className="badge badge-ai" style={{ fontSize: '0.75rem' }}>Powered by Google Gemini</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time personalized artificial intelligence analysis based on your live financial transactions and budget trends.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchInsights}
            className="btn btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh AI Analysis
          </button>

          <button
            onClick={() => setAiReportOpen(true)}
            className="btn btn-ai"
          >
            <Sparkles size={18} /> ✨ Generate AI Financial Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--ai-purple))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '1rem'
          }}>
            <Sparkles size={28} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Generating AI spending insights...
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Evaluating spending habits, month-over-month category variance, and budget limits.
          </p>
        </div>
      ) : !insights ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Unable to generate insights at this moment. Please verify server connectivity.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Card 1: Spending Pattern */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Lightbulb size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>💡 Spending Pattern</h3>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {insights.spendingPattern}
            </p>
          </div>

          {/* Card 2: Attention Required */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-amber)' }}>
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>⚠️ Attention Required</h3>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {insights.attentionRequired}
            </p>
          </div>

          {/* Card 3: Budget Recommendation */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--ai-purple-light)', color: 'var(--ai-purple)' }}>
                <Target size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>🎯 Budget Recommendation</h3>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {insights.budgetRecommendation}
            </p>
          </div>

          {/* Card 4: Saving Opportunity */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--income-bg)', color: 'var(--income-green)' }}>
                <PiggyBank size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>💰 Saving Opportunity</h3>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {insights.savingOpportunity}
            </p>
          </div>

          {/* Card 5: Financial Health Status */}
          <div className="card" style={{
            gridColumn: '1 / -1',
            backgroundColor: health?.status === 'Healthy' ? 'var(--income-bg)' : health?.status === 'Moderate' ? 'var(--warning-bg)' : 'var(--expense-bg)',
            borderColor: health?.status === 'Healthy' ? 'var(--income-green)' : health?.status === 'Moderate' ? 'var(--warning-amber)' : 'var(--expense-red)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem'
          }}>
            <div style={{
              padding: '0.75rem',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-card)',
              color: health?.status === 'Healthy' ? 'var(--income-green)' : health?.status === 'Moderate' ? 'var(--warning-amber)' : 'var(--expense-red)'
            }}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                📊 Financial Health: {health?.status || 'Healthy'}
              </div>
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {health?.reason}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informational Disclaimer Box */}
      <div className="card" style={{ backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <Info size={20} color="var(--primary)" style={{ shrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <strong>Disclaimer:</strong> AI-generated insights are for informational purposes only and are not professional financial advice.
        </div>
      </div>

      {/* AI Financial Report Modal */}
      <AIReportModal
        isOpen={aiReportOpen}
        onClose={() => setAiReportOpen(false)}
        reportData={{ insights }}
        loading={loading}
      />
    </div>
  );
}
