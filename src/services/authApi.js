// Replace with real SMS OTP backend and user database in production.

// In-memory store for OTP, expiry, and attempt counts (never in web storage)
let otpSession = {
  phone: null,
  otp: null,
  expiresAt: null,
  attempts: 0
};

// Mock persistence key for registered users (only non-sensitive profile info)
// Replace with real backend user registration in production.
const REGISTERED_USERS_KEY = 'registeredUsers';

/**
 * Retrieves mock registered users from localStorage.
 */
export function getRegisteredUsers() {
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Persists mock registered users to localStorage.
 */
export function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save registered users:', err);
  }
}

/**
 * Checks whether a user with the given phone number already exists.
 * Returns existing user details if found, or exists: false for new users.
 */
export async function checkUserExists(phone) {
  // Simulate brief network latency
  await new Promise((resolve) => setTimeout(resolve, 200));

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.phone === phone);

  if (existing) {
    return {
      exists: true,
      user: {
        ...existing,
        name: `${existing.firstName} ${existing.lastName}`.trim(),
        landmark: existing.landmark || '',
        area: existing.area || '',
        city: existing.city || '',
        pincode: existing.pincode || '',
        kycStatus: existing.kycStatus || 'pending'
      }
    };
  }

  return {
    exists: false,
    user: null
  };
}

/**
 * Registers a new user.
 * Simulates ~1 second latency.
 * Rejects duplicate email addresses.
 */
export async function registerUser({ firstName, lastName, email, phone }) {
  // Simulate ~1 second network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const users = getRegisteredUsers();
  const emailLower = (email || '').trim().toLowerCase();

  // Check for email collision (with registered users or default demo user)
  const isEmailTaken =
    users.some((u) => (u.email || '').toLowerCase() === emailLower) ||
    emailLower === 'rahul.sharma@example.com';

  if (isEmailTaken) {
    return {
      success: false,
      error: 'EMAIL_EXISTS',
      message: 'This email is already registered.'
    };
  }

  // Create new user record
  const newUser = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: emailLower,
    phone: phone.trim(),
    landmark: '',
    area: '',
    city: '',
    pincode: '',
    kycStatus: 'pending'
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  return {
    success: true,
    user: {
      ...newUser,
      name: `${newUser.firstName} ${newUser.lastName}`.trim()
    },
    message: 'Account registered successfully.'
  };
}

/**
 * Updates profile details for a registered user.
 */
export function updateRegisteredUserProfile(phone, updates) {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.phone === phone);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveRegisteredUsers(users);
    return users[index];
  }
  return null;
}

/**
 * Sends a random 6-digit OTP to the specified phone number.
 * Sets 2-minute expiration and resets wrong attempt counter.
 */
export async function sendOtp(phone) {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  otpSession = {
    phone,
    otp: generatedOtp,
    expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes expiry
    attempts: 0
  };

  return {
    success: true,
    otp: generatedOtp,
    message: 'OTP sent successfully.'
  };
}

/**
 * Resends a new 6-digit OTP to the phone number.
 * Resets timer and attempt counters.
 */
export async function resendOtp(phone) {
  return sendOtp(phone);
}

/**
 * Verifies the entered OTP against in-memory storage.
 * Enforces 2-minute expiry and max 3 wrong attempts.
 */
export async function verifyOtp(phone, enteredOtp) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!otpSession.otp || otpSession.phone !== phone) {
    return {
      success: false,
      error: 'NO_OTP',
      message: 'No active OTP session found. Please request a new OTP.'
    };
  }

  // Check 2-minute expiry
  if (Date.now() > otpSession.expiresAt) {
    return {
      success: false,
      error: 'EXPIRED',
      message: 'OTP has expired (valid for 2 minutes). Please resend OTP.'
    };
  }

  // Check max attempts
  if (otpSession.attempts >= 3) {
    return {
      success: false,
      error: 'MAX_ATTEMPTS',
      attemptsLeft: 0,
      message: 'Maximum 3 wrong attempts reached. Please resend OTP to continue.'
    };
  }

  // Check match
  if (enteredOtp === otpSession.otp) {
    // Clear session on successful login
    otpSession = {
      phone: null,
      otp: null,
      expiresAt: null,
      attempts: 0
    };
    return {
      success: true,
      message: 'OTP verified successfully.'
    };
  }

  // Increment wrong attempt counter
  otpSession.attempts += 1;
  const remaining = 3 - otpSession.attempts;

  if (remaining <= 0) {
    return {
      success: false,
      error: 'MAX_ATTEMPTS',
      attemptsLeft: 0,
      message: 'Maximum 3 wrong attempts reached. Please resend OTP to continue.'
    };
  }

  return {
    success: false,
    error: 'INVALID_OTP',
    attemptsLeft: remaining,
    message: `Incorrect OTP. ${remaining} attempt(s) remaining.`
  };
}
