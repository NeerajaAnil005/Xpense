import React, { useState, useEffect } from 'react';
import { budgetService } from '../services/api';
import BudgetModal from '../components/BudgetModal';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, AlertTriangle, ShieldCheck, PieChart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Budgets() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, totalRemaining: 0, overallPercentage: 0 });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetService.getAll({ month, year });
      if (res.data.success) {
        setBudgets(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleSaveBudget = async (data) => {
    if (editingBudget) {
      await budgetService.update(editingBudget.id, { amount: data.amount });
    } else {
      await budgetService.createOrUpdate(data);
    }
    fetchBudgets();
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await budgetService.delete(deletingId);
      setDeleteModalOpen(false);
      setDeletingId(null);
      fetchBudgets();
    }
  };

  const handleMonthChange = (delta) => {
    let newM = month + delta;
    let newY = year;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    } else if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setMonth(newM);
    setYear(newY);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currency = user?.currency || 'INR';
  const symbol = currency === 'USD' ? '$' : '₹';

  // Warnings count
  const exceededCount = budgets.filter(b => b.percentage >= 100).length;
  const warningCount = budgets.filter(b => b.percentage >= 80 && b.percentage < 100).length;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Budget Management & Monitoring
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Set category budget limits and monitor live expense progress to avoid overspending.
          </p>
        </div>

        <button
          onClick={() => { setEditingBudget(null); setModalOpen(true); }}
          className="btn btn-primary"
        >
          <Plus size={18} /> Create Budget Target
        </button>
      </div>

      {/* Month Picker Controls & Summary Overview Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => handleMonthChange(-1)} className="btn btn-secondary btn-sm">
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', minWidth: '160px', textAlign: 'center' }}>
              {monthNames[month - 1]} {year}
            </span>
            <button onClick={() => handleMonthChange(1)} className="btn btn-secondary btn-sm">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Budget Health Summary Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {exceededCount > 0 && (
              <span className="badge badge-expense" style={{ padding: '0.375rem 0.75rem' }}>
                🚨 {exceededCount} Budget Exceeded
              </span>
            )}
            {warningCount > 0 && (
              <span className="badge badge-warning" style={{ padding: '0.375rem 0.75rem' }}>
                ⚠️ {warningCount} High Usage (&gt;80%)
              </span>
            )}
            {exceededCount === 0 && warningCount === 0 && (
              <span className="badge badge-income" style={{ padding: '0.375rem 0.75rem' }}>
                ✅ All Budgets Healthy
              </span>
            )}
          </div>
        </div>

        {/* Overall Month Budget Usage Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <span>Total Monthly Spending Limit</span>
            <span>
              {symbol}{Number(summary.totalSpent).toLocaleString('en-IN')} / {symbol}{Number(summary.totalBudget).toLocaleString('en-IN')} ({summary.overallPercentage}% Used)
            </span>
          </div>
          <div className="progress-bar-bg" style={{ height: '0.75rem' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.min(100, summary.overallPercentage)}%`,
                backgroundColor: summary.overallPercentage >= 100 ? 'var(--expense-red)' : summary.overallPercentage >= 80 ? 'var(--warning-amber)' : 'var(--primary)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading category budgets...
        </div>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <PieChart size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Budgets Configured for {monthNames[month - 1]} {year}
          </h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Establish category budgets for Food, Shopping, Transport, and Bills to get automatic threshold alerts.
          </p>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Create Budget Target
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {budgets.map(b => (
            <div key={b.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {b.category}
                </h3>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    onClick={() => { setEditingBudget(b); setModalOpen(true); }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.5rem' }}
                    title="Edit Budget"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => { setDeletingId(b.id); setDeleteModalOpen(true); }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.25rem 0.5rem', color: 'var(--expense-red)' }}
                    title="Delete Budget"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {symbol}{Number(b.spent).toLocaleString('en-IN')}
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    {' '}/ {symbol}{Number(b.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Remaining: <strong>{symbol}{Number(b.remaining).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Progress Bar & Status Badge */}
              <div>
                <div className="progress-bar-bg" style={{ height: '0.625rem', marginBottom: '0.5rem' }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(100, b.percentage)}%`,
                      backgroundColor: b.status === 'exceeded' ? 'var(--expense-red)' : b.status === 'warning' ? 'var(--warning-amber)' : 'var(--income-green)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {b.percentage}% used
                  </span>

                  <span className={`badge badge-${b.status === 'exceeded' ? 'expense' : b.status === 'warning' ? 'warning' : 'income'}`}>
                    {b.status === 'exceeded' ? 'Exceeded' : b.status === 'warning' ? 'Near Limit' : 'Healthy'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialogs */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingBudget(null); }}
        onSave={handleSaveBudget}
        budget={editingBudget}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Budget"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to remove this category budget limit?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
              Delete Budget
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
