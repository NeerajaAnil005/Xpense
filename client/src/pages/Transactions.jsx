import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import TransactionModal from '../components/TransactionModal';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  Calendar
} from 'lucide-react';

const CATEGORIES = [
  'All', 'Salary', 'Freelance', 'Scholarship', 'Business', 
  'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 
  'Education', 'Healthcare', 'Rent', 'Other'
];

const PAYMENT_METHODS = ['All', 'Cash', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Other'];

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [datePreset, setDatePreset] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getAll({
        search,
        type,
        category,
        paymentMethod,
        datePreset,
        startDate,
        endDate,
        sortBy,
        page,
        limit: 10
      });
      if (res.data.success) {
        setTransactions(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, type, category, paymentMethod, datePreset, startDate, endDate, sortBy, page]);

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setCategory('All');
    setPaymentMethod('All');
    setDatePreset('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
    setPage(1);
  };

  const handleSaveTransaction = async (data) => {
    if (editingTx) {
      await transactionService.update(editingTx.id, data);
    } else {
      await transactionService.create(data);
    }
    fetchTransactions();
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await transactionService.delete(deletingId);
      setDeleteModalOpen(false);
      setDeletingId(null);
      fetchTransactions();
    }
  };

  const handleExportCSV = () => {
    window.open(transactionService.exportCSVUrl(), '_blank');
  };

  const currency = user?.currency || 'INR';
  const symbol = currency === 'USD' ? '$' : '₹';

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Transactions Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Add, filter, search, and export all your income and expense transactions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary"
            title="Print or Save as PDF"
          >
            🖨️ Save PDF
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
          >
            <Download size={18} /> Export CSV
          </button>

          <button
            onClick={() => { setEditingTx(null); setModalOpen(true); }}
            className="btn btn-primary"
          >
            <Plus size={18} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Top Row: Search & Type Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search description or category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.375rem', backgroundColor: 'var(--bg-primary)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            {['all', 'income', 'expense'].map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setPage(1); }}
                style={{
                  padding: '0.375rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  backgroundColor: type === t ? 'var(--bg-card)' : 'transparent',
                  color: type === t ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: type === t ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Dropdown Filters & Date Presets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {/* Category Dropdown */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Method</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Date Shortcuts */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Date Shortcut</label>
            <select
              className="form-select"
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value);
                setStartDate('');
                setEndDate('');
                setPage(1);
              }}
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Amount: High to Low</option>
              <option value="amount_low">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleResetFilters} className="btn btn-secondary btn-sm">
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No transactions match the selected filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700 }}>Payment Method</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '0.875rem 1.25rem', fontWeight: 700, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {t.transaction_date}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {t.description}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)' }}>
                      {t.payment_method}
                    </td>
                    <td style={{
                      padding: '0.875rem 1.25rem',
                      textAlign: 'right',
                      fontWeight: 800,
                      color: t.type === 'income' ? 'var(--income-green)' : 'var(--expense-red)'
                    }}>
                      {t.type === 'income' ? '+' : '-'}{symbol}{Number(t.amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => { setEditingTx(t); setModalOpen(true); }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem' }}
                          title="Edit Transaction"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => { setDeletingId(t.id); setDeleteModalOpen(true); }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', color: 'var(--expense-red)' }}
                          title="Delete Transaction"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div style={{
            padding: '0.875rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-primary)'
          }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} items)
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-secondary btn-sm"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        onSave={handleSaveTransaction}
        transaction={editingTx}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}>
              Delete Transaction
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
