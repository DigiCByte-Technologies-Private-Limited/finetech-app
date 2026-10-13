import { Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import InsuranceProvider from './context/InsuranceContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cards from './pages/Cards';
import Loans from './pages/Loans';
import Insurance from './pages/Insurance';
import Extensions from './pages/Extensions';
import StepTypePicker from './pages/extensions/StepTypePicker';
import StepDocuments from './pages/extensions/StepDocuments';
import StepBanks from './pages/extensions/StepBanks';
import StepBankDetail from './pages/extensions/StepBankDetail';
import StepReview from './pages/extensions/StepReview';
import Settings from './pages/Settings';

/**
 * App component with AuthProvider and React Router v6 nested routes.
 */
export default function App() {
  return (
    <AuthProvider>
      <InsuranceProvider>
        <Routes>
          {/* Public route */}
          <Route
            path="/login"
            element={
              <ProtectedRoute publicOnly>
                <Login />
              </ProtectedRoute>
            }
          />

          {/* Protected routes rendered inside shared AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/insurance" element={<Insurance />} />

            {/* Nested Extensions Multi-Step Flow */}
            <Route path="/extensions" element={<Extensions />}>
              <Route index element={<StepTypePicker />} />
              <Route path="loan/:type/documents" element={<StepDocuments />} />
              <Route path="loan/:type/banks" element={<StepBanks />} />
              <Route path="loan/:type/banks/:bankId" element={<StepBankDetail />} />
              <Route path="loan/:type/review" element={<StepReview />} />
            </Route>

            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* "/" redirects to /dashboard; unknown paths redirect to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </InsuranceProvider>
    </AuthProvider>
  );
}
