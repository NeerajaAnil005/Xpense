import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import TransactionModal from '../components/TransactionModal';
import BudgetModal from '../components/BudgetModal';
import AIReportModal from '../components/AIReportModal';
import { 
  transactionService, 
  budgetService, 
  reportService, 
  aiService 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  PiggyBank, 
  PlusCircle, 
  MinusCircle, 
  PieChart as PieIcon, 
  BarChart3, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyChart, setMonthlyChart] = useState([]);
  const [categoryChart, setCategoryChart] = useState([]);
  const [trendChart, setTrendChart] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txInitialType, setTxInitialType] = useState('expense');
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [aiReportOpen, setAiReportOpen] = useState(false);
  const [aiReportData, setAiReportData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        txRes,
        monthlyRes,
        catRes,
        trendRes,
        budgetRes
      ] = await Promise.all([
        transactionService.getSummaryStats(),
        transactionService.getAll({ limit: 5 }),
        reportService.getMonthly(),
        reportService.getCategories({ type: 'expense' }),
        reportService.getTrends({}),
        budgetService.getAll({})
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (txRes.data.success) setRecentTransactions(txRes.data.data);
      if (monthlyRes.data.success) setMonthlyChart(monthlyRes.data.data);
      if (catRes.data.success) setCategoryChart(catRes.data.data);
      if (trendRes.data.success) setTrendChart(trendRes.data.data);
      if (budgetRes.data.success) setBudgets(budgetRes.data.data);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTransaction = async (data) => {
    await transactionService.create(data);
    fetchDashboardData();
  };

  const handleCreateBudget = async (data) => {
    await budgetService.createOrUpdate(data);
    fetchDashboardData();
  };

  const handleGenerateAIReport = async () => {
    setAiReportOpen(true);
    setAiLoading(true);
    try {
      const res = await aiService.getMonthlySummary();
      if (res.data.success) {
        setAiReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to generate AI report:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const currency = user?.currency || 'INR';
  const symbol = currency === 'USD' ? '$' : '₹';

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'} 👋
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Here is your live financial overview and budget health for this month.
          </p>
        </div>

        {/* Quick Actions Header Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setTxInitialType('income'); setTxModalOpen(true); }}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--income-green)' }}
          >
            <PlusCircle size={16} /> Add Income
          </button>
          <button
            onClick={() => { setTxInitialType('expense'); setTxModalOpen(true); }}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--expense-red)' }}
          >
            <MinusCircle size={16} /> Add Expense
          </button>
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <PieIcon size={16} /> Create Budget
          </button>
          <button
            onClick={handleGenerateAIReport}
            className="btn btn-ai btn-sm"
          >
            <Sparkles size={16} /> AI Report
          </button>
        </div>
      </div>

      {/* 6 Summary Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard
          title="Total Balance"
          amount={stats.totalBalance}
          currency={currency}
          icon={Wallet}
          variant="primary"
          subtext="Net cumulative balance"
        />
        <StatCard
          title="Monthly Income"
          amount={stats.monthlyIncome}
          currency={currency}
          icon={TrendingUp}
          variant="income"
          subtext="Income recorded this month"
        />
        <StatCard
          title="Monthly Expenses"
          amount={stats.monthlyExpenses}
          currency={currency}
          icon={TrendingDown}
          variant="expense"
          subtext="Expenses paid this month"
        />
        <StatCard
          title="Total Income"
          amount={stats.totalIncome}
          currency={currency}
          icon={TrendingUp}
          variant="income"
          subtext="All time total income"
        />
        <StatCard
          title="Total Expenses"
          amount={stats.totalExpenses}
          currency={currency}
          icon={TrendingDown}
          variant="expense"
          subtext="All time total expenses"
        />
        <StatCard
          title="Total Savings"
          amount={stats.savings}
          currency={currency}
          icon={PiggyBank}
          variant="ai"
          subtext="Total net savings accumulated"
        />
      </div>

      {/* Main Visualizations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
        {/* Income vs Expenses Chart */}
        <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Income vs Expenses</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Comparison</span>
          </div>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            {monthlyChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    formatter={(value) => [`${symbol}${Number(value).toLocaleString('en-IN')}`, '']}
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No monthly data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Expenses by Category</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Month</span>
          </div>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            {categoryChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {categoryChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    formatter={(value) => [`${symbol}${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No category expense data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Grid: Budget Progress & Recent Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
        {/* Category Budget Progress Bars */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Budget Usage Progress</h3>
            <Link to="/budgets" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All Budgets →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {budgets.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No category budgets set for this month. <br />
                <button onClick={() => setBudgetModalOpen(true)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem' }}>
                  Create Budget
                </button>
              </div>
            ) : (
              budgets.slice(0, 4).map(b => (
                <div key={b.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600 }}>{b.category}</span>
                    <span style={{ fontWeight: 700, color: b.percentage >= 100 ? 'var(--expense-red)' : b.percentage >= 80 ? 'var(--warning-amber)' : 'var(--text-primary)' }}>
                      {symbol}{Number(b.spent).toLocaleString('en-IN')} / {symbol}{Number(b.amount).toLocaleString('en-IN')} ({b.percentage}%)
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(100, b.percentage)}%`,
                        backgroundColor: b.percentage >= 100 ? 'var(--expense-red)' : b.percentage >= 80 ? 'var(--warning-amber)' : 'var(--income-green)'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Transactions</h3>
            <Link to="/transactions" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentTransactions.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No transactions recorded yet.
              </div>
            ) : (
              recentTransactions.map(t => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '50%',
                      backgroundColor: t.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
                      color: t.type === 'income' ? 'var(--income-green)' : 'var(--expense-red)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {t.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {t.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {t.category} • {t.payment_method} • {t.transaction_date}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontWeight: 800,
                    fontSize: '0.9375rem',
                    color: t.type === 'income' ? 'var(--income-green)' : 'var(--expense-red)'
                  }}>
                    {t.type === 'income' ? '+' : '-'}{symbol}{Number(t.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dialog Modals */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSave={handleCreateTransaction}
        initialType={txInitialType}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSave={handleCreateBudget}
      />

      <AIReportModal
        isOpen={aiReportOpen}
        onClose={() => setAiReportOpen(false)}
        reportData={aiReportData}
        loading={aiLoading}
      />
    </div>
  );
}
