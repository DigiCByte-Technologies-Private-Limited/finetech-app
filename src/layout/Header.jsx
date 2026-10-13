import ProfileDropdown from './ProfileDropdown';

/**
 * Top Header Component.
 * Flat, white, 1px bottom border.
 * Offset by the left sidebar on desktop.
 */
export default function Header({ onToggleSidebar, onOpenChat }) {
  return (
    <header className="bg-white border-b border-[#DDE2E0] sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile sidebar toggle + brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-[#5B6B73] hover:text-[#16232B]"
              aria-label="Open navigation sidebar"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>

            {/* Mobile Brand Name */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-[4px] bg-[#0B4F6C] text-white flex items-center justify-center text-xs font-semibold">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className="text-base font-semibold text-[#16232B]">
                FinPulse
              </span>
            </div>

            {/* Desktop breadcrumb / system state */}
            <div className="hidden lg:flex items-center gap-2 text-[13px] text-[#5B6B73]">
              <span className="w-2 h-2 rounded-full bg-[#1F7A4D]"></span>
              <span>Encrypted banking connection</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick FinChat Trigger */}
            <button
              type="button"
              onClick={onOpenChat}
              className="h-[36px] px-3 border border-[#DDE2E0] rounded-[8px] text-[13px] font-medium text-[#16232B] hover:bg-[#F5F6F4] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-comments text-xs text-[#0B4F6C]"></i>
              <span className="hidden sm:inline">Ask assistant</span>
            </button>

            {/* Profile Menu */}
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
