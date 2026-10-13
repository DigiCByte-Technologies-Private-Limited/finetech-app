import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Sidebar Navigation Component.
 * Flat, sober design with a 3px brand-coloured left bar on active items.
 * Placed on the left side:
 * - Dashboard
 * - Cards
 * - Loans
 * - Insurance
 * - Apply for loan
 * - Settings
 */
export default function Sidebar({ isOpen, onClose, onOpenChat }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie' },
    { to: '/cards', label: 'Cards', icon: 'fa-solid fa-credit-card' },
    { to: '/loans', label: 'Loans', icon: 'fa-solid fa-hand-holding-dollar' },
    { to: '/insurance', label: 'Insurance', icon: 'fa-solid fa-shield-heart' },
    { to: '/extensions', label: 'Extensions', icon: 'fa-solid fa-puzzle-piece' },
    { to: '/settings', label: 'Settings', icon: 'fa-solid fa-gear' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const getInitials = () => {
    if (!user) return 'U';
    const first = (user.firstName || user.name || 'U')[0] || '';
    const last = (user.lastName || '')[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#16232B]/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-[#DDE2E0] z-50 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand mark */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#DDE2E0]">
            <Link
              to="/dashboard"
              onClick={onClose}
              className="flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-[4px] bg-[#0B4F6C] text-white flex items-center justify-center text-sm font-semibold">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className="text-lg font-semibold tracking-tight text-[#16232B]">
                FinPulse
              </span>
            </Link>

            {/* Mobile close */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 text-[#5B6B73] hover:text-[#16232B]"
              aria-label="Close sidebar"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="py-4 space-y-0.5" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-[15px] transition-colors border-l-[3px] ${
                    isActive
                      ? 'border-[#0B4F6C] text-[#0B4F6C] font-medium bg-[#E3EEF3]/40'
                      : 'border-transparent text-[#5B6B73] hover:text-[#16232B] hover:bg-[#F5F6F4]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <i
                      className={`${item.icon} text-sm w-4 ${
                        isActive ? 'text-[#0B4F6C]' : 'text-[#5B6B73]'
                      }`}
                    ></i>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}

            {/* FinChat Trigger */}
            <div className="pt-4 px-6">
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  if (onOpenChat) onOpenChat();
                }}
                className="w-full h-[40px] px-3 border border-[#DDE2E0] rounded-[8px] text-[13px] font-medium text-[#16232B] hover:bg-[#F5F6F4] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-comments text-xs text-[#0B4F6C]"></i>
                  <span>Financial assistant</span>
                </div>
                <span className="text-[11px] text-[#5B6B73] bg-[#F5F6F4] px-1.5 py-0.5 rounded-[4px] border border-[#DDE2E0]">
                  Chat
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* User snapshot and logout */}
        <div className="p-4 border-t border-[#DDE2E0]">
          <div className="flex items-center justify-between p-2 rounded-[4px] bg-[#F5F6F4]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[4px] bg-[#0B4F6C] text-white flex items-center justify-center font-medium text-xs shrink-0 tabular-nums">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#16232B] truncate">
                  {user?.name || user?.firstName || 'User'}
                </p>
                <p className="text-[11px] text-[#5B6B73] truncate tabular-nums">
                  +91 {user?.phone}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 text-[#5B6B73] hover:text-[#B3261E] rounded-[4px] transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
