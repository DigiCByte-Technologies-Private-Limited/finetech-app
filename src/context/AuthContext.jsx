import { useState } from 'react';
import { AuthContext } from './authContextInstance';
import { getRegisteredUsers, updateRegisteredUserProfile } from '../services/authApi';

const STORAGE_KEY = 'fintech_session_auth';

export function AuthProvider({ children }) {
  // Initialize from sessionStorage so page reloads maintain session
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (phone, customUser = null) => {
    let profile;

    if (customUser) {
      profile = {
        firstName: customUser.firstName || '',
        lastName: customUser.lastName || '',
        name: `${customUser.firstName || ''} ${customUser.lastName || ''}`.trim() || 'User',
        email: customUser.email || '',
        phone: customUser.phone || phone,
        landmark: customUser.landmark || '',
        area: customUser.area || '',
        city: customUser.city || '',
        pincode: customUser.pincode || '',
        kycStatus: customUser.kycStatus || 'pending'
      };
    } else {
      const registered = getRegisteredUsers();
      const existing = registered.find((u) => u.phone === phone);

      if (existing) {
        profile = {
          firstName: existing.firstName,
          lastName: existing.lastName,
          name: `${existing.firstName} ${existing.lastName}`.trim(),
          email: existing.email,
          phone: existing.phone,
          landmark: existing.landmark || '',
          area: existing.area || '',
          city: existing.city || '',
          pincode: existing.pincode || '',
          kycStatus: existing.kycStatus || 'pending'
        };
      } else {
        // Fallback demo user for 9876543210 or general test
        profile = {
          firstName: 'Rahul',
          lastName: 'Sharma',
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          phone,
          landmark: 'Near Metro Station',
          area: 'Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
          kycStatus: 'Verified'
        };
      }
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to save session:', err);
    }
    setUser(profile);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const firstName = updates.firstName !== undefined ? updates.firstName : prev.firstName;
      const lastName = updates.lastName !== undefined ? updates.lastName : prev.lastName;
      const name = `${firstName} ${lastName}`.trim() || prev.name;

      const updated = {
        ...prev,
        ...updates,
        firstName,
        lastName,
        name
      };

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update session:', err);
      }

      // Also persist to mock registered users registry
      updateRegisteredUserProfile(updated.phone, updated);

      return updated;
    });
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    updateUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
