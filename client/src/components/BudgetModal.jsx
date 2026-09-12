import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const BUDGET_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 
  'Education', 'Healthcare', 'Rent', 'Other'
];

export default function BudgetModal({ isOpen, onClose, onSave, budget = null }) {
  const now = new Date();
  const [formData, setFormData] = useState({
    category: 'Food',
    amount: '',
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount.toString(),
        month: budget.month,
        year: budget.year
      });
    } else {
      setFormData({
        category: 'Food',
        amount: '',
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
    }
    setError('');
  }, [budget, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid budget amount greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        category: formData.category,
        amount: numAmount,
        month: parseInt(formData.month, 10),
        year: parseInt(formData.year, 10)
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? `Edit Budget: ${budget.category}` : 'Create Category Budget'}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'var(--expense-bg)',
            color: 'var(--expense-red)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Expense Category</label>
          <select
            className="form-select"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={!!budget} // category locked when editing existing budget
          >
            {BUDGET_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Budget Amount */}
        <div className="form-group">
          <label className="form-label">Monthly Budget Limit (₹)</label>
          <input
            type="number"
            step="1"
            className="form-input"
            placeholder="e.g. 5000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>

        {/* Month & Year Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Month</label>
            <select
              className="form-select"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Year</label>
            <select
              className="form-select"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : (budget ? 'Update Budget' : 'Create Budget')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
