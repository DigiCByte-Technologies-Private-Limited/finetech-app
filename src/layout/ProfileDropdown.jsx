import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Profile Dropdown Component.
 * Displays user name, email, phone number, KYC status, settings link, and sign out.
 */
export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'U';
    const first = (user.firstName || user.name || 'U')[0] || '';
    const last = (user.lastName || '')[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const isVerified = user?.kycStatus?.toLowerCase() === 'verified';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-[4px] hover:bg-[#F5F6F4] transition-colors cursor-pointer text-left"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-[4px] bg-[#0B4F6C] text-white flex items-center justify-center font-medium text-xs tabular-nums">
          {getInitials()}
        </div>
        <div className="hidden sm:block">
          <p className="text-[13px] font-medium text-[#16232B] leading-tight">
            {user?.name || user?.firstName || 'User'}
          </p>
          <p className="text-[11px] text-[#5B6B73] leading-tight truncate max-w-[120px]">
            {user?.email || `+91 ${user?.phone}`}
          </p>
        </div>
        <i
          className={`fa-solid fa-chevron-down text-[10px] text-[#5B6B73] hidden sm:block transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        ></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-white rounded-[8px] shadow-sm border border-[#DDE2E0] py-2 z-50">
          <div className="px-4 py-2.5 border-b border-[#DDE2E0]">
            <p className="text-[15px] font-semibold text-[#16232B]">
              {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
            </p>
            <p className="text-[13px] text-[#5B6B73] truncate mt-0.5">
              {user?.email || 'No email registered'}
            </p>
            <p className="text-[11px] text-[#5B6B73] tabular-nums mt-0.5">
              +91 {user?.phone}
            </p>

            <div className="mt-2 flex items-center">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                  isVerified
                    ? 'bg-[#1F7A4D]/10 text-[#1F7A4D]'
                    : 'bg-[#B86E00]/10 text-[#B86E00]'
                }`}
              >
                <i
                  className={`fa-solid ${
                    isVerified ? 'fa-circle-check' : 'fa-clock'
                  } text-[10px]`}
                ></i>
                <span>KYC {isVerified ? 'verified' : 'pending'}</span>
              </span>
            </div>
          </div>

          <div className="py-1">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-[#16232B] hover:bg-[#F5F6F4] transition-colors"
            >
              <i className="fa-solid fa-gear text-[#5B6B73] text-xs"></i>
              <span>Account settings</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-[#DDE2E0]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium text-[#B3261E] hover:bg-[#F5F6F4] transition-colors cursor-pointer text-left"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
