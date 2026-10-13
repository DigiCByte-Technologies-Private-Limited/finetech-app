import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * SubHeader Component.
 * Greets user in sentence case and shows residence location.
 * Links to settings if location is not configured.
 */
export default function SubHeader() {
  const { user } = useAuth();

  const locationParts = [user?.landmark, user?.area, user?.city].filter(
    (part) => Boolean(part && part.trim())
  );

  const displayLocation =
    locationParts.length > 0 ? locationParts.join(', ') : user?.location;

  const hasLocation = Boolean(displayLocation && displayLocation.trim());

  const displayName =
    user?.firstName ||
    (user?.name ? user.name.split(' ')[0] : 'User');

  return (
    <div className="bg-white border-b border-[#DDE2E0] px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[15px] text-[#16232B]">
            Welcome back, <strong className="font-semibold text-[#0B4F6C]">{displayName}</strong>.
          </span>
        </div>

        <div className="flex items-center text-[13px]">
          {hasLocation ? (
            <div className="flex items-center gap-1.5 text-[#5B6B73]">
              <i className="fa-solid fa-location-dot text-xs text-[#0B4F6C]"></i>
              <span className="truncate max-w-[240px] text-[#16232B]">{displayLocation}</span>
              <Link
                to="/settings"
                title="Edit location in settings"
                className="text-[#0B4F6C] hover:underline ml-1"
              >
                Edit
              </Link>
            </div>
          ) : (
            <Link
              to="/settings"
              className="text-[#0B4F6C] hover:underline flex items-center gap-1.5 font-medium"
            >
              <i className="fa-solid fa-location-dot text-xs"></i>
              <span>Add your location in settings</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
