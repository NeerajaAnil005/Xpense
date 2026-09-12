import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Scholarship', 'Business', 'Investments', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Healthcare', 'Rent', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Other'];

export default function TransactionModal({ isOpen, onClose, onSave, transaction = null, initialType = 'expense' }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    customCategory: '',
    description: '',
    payment_method: 'UPI',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      const categories = transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      const isCustom = !categories.includes(transaction.category);
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: isCustom ? 'Other' : transaction.category,
        customCategory: isCustom ? transaction.category : '',
        description: transaction.description,
        payment_method: transaction.payment_method,
        transaction_date: transaction.transaction_date
      });
      setIsCustomCategory(isCustom);
    } else {
      setFormData({
        type: initialType,
        amount: '',
        category: initialType === 'income' ? 'Salary' : 'Food',
        customCategory: '',
        description: '',
        payment_method: 'UPI',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      setIsCustomCategory(false);
    }
    setError('');
  }, [transaction, initialType, isOpen]);

  const handleTypeChange = (newType) => {
    const defaultCat = newType === 'income' ? 'Salary' : 'Food';
    setFormData(prev => ({ ...prev, type: newType, category: defaultCat, customCategory: '' }));
    setIsCustomCategory(false);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === 'Custom') {
      setIsCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setIsCustomCategory(false);
      setFormData(prev => ({ ...prev, category: val, customCategory: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalCategory = isCustomCategory ? formData.customCategory.trim() : formData.category.trim();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    if (!finalCategory) {
      setError('Category is required.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required.');
      return;
    }

    if (!formData.transaction_date) {
      setError('Date is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: finalCategory,
        description: formData.description.trim(),
        payment_method: formData.payment_method,
        transaction_date: formData.transaction_date
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Add New Transaction'}
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

        {/* Type Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className="btn"
            style={{
              flex: 1,
              backgroundColor: formData.type === 'expense' ? 'var(--expense-bg)' : 'var(--bg-primary)',
              color: formData.type === 'expense' ? 'var(--expense-red)' : 'var(--text-secondary)',
              border: `1px solid ${formData.type === 'expense' ? 'var(--expense-red)' : 'var(--border-color)'}`
            }}
          >
            💸 Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className="btn"
            style={{
              flex: 1,
              backgroundColor: formData.type === 'income' ? 'var(--income-bg)' : 'var(--bg-primary)',
              color: formData.type === 'income' ? 'var(--income-green)' : 'var(--text-secondary)',
              border: `1px solid ${formData.type === 'income' ? 'var(--income-green)' : 'var(--border-color)'}`
            }}
          >
            💰 Income
          </button>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          {!isCustomCategory ? (
            <select
              className="form-select"
              value={formData.category}
              onChange={handleCategoryChange}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="Custom">+ Add Custom Category</option>
            </select>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter custom category name"
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                required
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIsCustomCategory(false);
                  setFormData({ ...formData, category: categories[0] });
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Weekly grocery shopping"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        {/* Payment Method */}
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <select
            className="form-select"
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
          >
            {PAYMENT_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">Transaction Date</label>
          <input
            type="date"
            className="form-input"
            value={formData.transaction_date}
            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
            required
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : (transaction ? 'Update Transaction' : 'Add Transaction')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
