import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AIReportModal from '../components/AIReportModal';
import { aiService } from '../services/api';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiReportOpen, setAiReportOpen] = useState(false);
  const [aiReportData, setAiReportData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const openAIReport = async () => {
    setAiReportOpen(true);
    setAiLoading(true);
    try {
      const res = await aiService.getMonthlySummary();
      if (res.data.success) {
        setAiReportData(res.data);
      }
    } catch (err) {
      console.error('Error triggering AI report:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileOpen} closeMobileSidebar={closeMobileSidebar} />

      <div className="main-content">
        <Navbar toggleMobileSidebar={toggleMobileSidebar} openAIReport={openAIReport} />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <AIReportModal
        isOpen={aiReportOpen}
        onClose={() => setAiReportOpen(false)}
        reportData={aiReportData}
        loading={aiLoading}
      />
    </div>
  );
}
