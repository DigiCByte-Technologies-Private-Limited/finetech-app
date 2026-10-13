import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SubHeader from './SubHeader';
import FinChatModal from '../components/FinChatModal';

/**
 * Shared AppLayout component for protected routes.
 * Features:
 * - Persistent left-side Sidebar with desktop docking (lg:pl-64) and mobile drawer
 * - Header with mobile menu toggle and quick FinChat AI assistant trigger
 * - SubHeader with user greeting and location link
 * - Flat 1px borders, chalk background, quiet muted footer
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F6F4] text-[#16232B] flex flex-col">
      {/* Left Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenChat={() => setChatOpen(true)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenChat={() => setChatOpen(true)}
        />

        <SubHeader />

        <main className="flex-1">
          <Outlet />
        </main>

        {/* Quiet, small, muted footer */}
        <footer className="border-t border-[#DDE2E0] bg-white py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#5B6B73]">
          <p>FinPulse Technologies • Regulated partner banking services</p>
        </footer>
      </div>

      {/* FinPulse Financial Chat Assistant Modal */}
      <FinChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
