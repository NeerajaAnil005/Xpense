import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  PieChart as PieIcon,
  DollarSign,
  Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Reports() {
  const { user } = useAuth();

  // Filters State
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data States
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    avgDailySpending: 0,
    highestExpenseCategory: 'N/A',
    highestExpenseAmount: 0
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [incomeCategoryData, setIncomeCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [budgetVsActualData, setBudgetVsActualData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = { category, type, startDate, endDate };

      const [
        summaryRes,
        monthlyRes,
        catRes,
        incCatRes,
        trendRes,
        bvsRes
      ] = await Promise.all([
        reportService.getSummary(params),
        reportService.getMonthly(),
        reportService.getCategories({ ...params, type: 'expense' }),
        reportService.getCategories({ ...params, type: 'income' }),
        reportService.getTrends(params),
        reportService.getBudgetVsActual({})
      ]);

      if (summaryRes.data.success) setSummary(summaryRes.data.data);
      if (monthlyRes.data.success) setMonthlyData(monthlyRes.data.data);
      if (catRes.data.success) setCategoryData(catRes.data.data);
      if (incCatRes.data.success) setIncomeCategoryData(incCatRes.data.data);
      if (trendRes.data.success) setTrendData(trendRes.data.data);
      if (bvsRes.data.success) setBudgetVsActualData(bvsRes.data.data);

    } catch (err) {
      console.error('Error loading reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [category, type, startDate, endDate]);

  const currency = user?.currency || 'INR';
  const symbol = currency === 'USD' ? '$' : '₹';

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Financial Reports & Analytics
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Deep-dive into income trends, expense patterns, and budget variances with dynamic visualizations.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Start Date</label>
          <input
            type="date"
            className="form-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>End Date</label>
          <input
            type="date"
            className="form-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Healthcare', 'Salary', 'Freelance', 'Other'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>Transaction Type</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>
      </div>

      {/* Financial Summary Highlight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Income</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--income-green)', marginTop: '0.25rem' }}>
            {symbol}{Number(summary.totalIncome).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Expenses</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--expense-red)', marginTop: '0.25rem' }}>
            {symbol}{Number(summary.totalExpenses).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Net Savings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {symbol}{Number(summary.netSavings).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Avg. Daily Spending</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning-amber)', marginTop: '0.25rem' }}>
            {symbol}{Number(summary.avgDailySpending).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Top Expense Category</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {summary.highestExpenseCategory} ({symbol}{Number(summary.highestExpenseAmount).toLocaleString('en-IN')})
          </div>
        </div>
      </div>

      {/* Visualizations Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
        {/* 1. Monthly Income vs Expense Bar Chart */}
        <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>1. Monthly Income vs Expenses</h3>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Category-Wise Expenses Pie Chart */}
        <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>2. Category Expense Breakdown</h3>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={({ name, percentage }) => `${name} ${percentage}%`}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No category data available for filter.
              </div>
            )}
          </div>
        </div>

        {/* 3. Daily Spending Trends Line Chart */}
        <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>3. Spending Trends Over Time</h3>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="expense" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Expense (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Budget vs Actual Spending Comparison */}
        <div className="card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>4. Budget Target vs Actual Spending</h3>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            {budgetVsActualData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActualData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="category" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="budget" fill="#6366f1" radius={[4, 4, 0, 0]} name="Budget Limit" />
                  <Bar dataKey="actual" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Actual Spent" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No budget targets set for this month.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
