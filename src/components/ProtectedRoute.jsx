import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * ProtectedRoute component.
 * - If not authenticated: redirects to /login.
 * - If authenticated and visits /login (publicOnly=true): redirects to /dashboard.
 */
export default function ProtectedRoute({ children, publicOnly = false }) {
  const { isAuthenticated } = useAuth();

  if (publicOnly) {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return children ? children : <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}
