import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  sendOtp,
  verifyOtp,
  resendOtp,
  checkUserExists,
  registerUser
} from '../services/authApi';
import {
  validateName,
  capitalizeWords,
  validateEmail,
  validateTerms
} from '../utils/validators';

/**
 * Login and registration component.
 * Split layout on desktop (brand panel on left, form on chalk on right).
 * 3-step sequential flow: Phone -> Verify -> Details.
 * Strict design system: 48px inputs, 44px 8px-radius buttons, non-floating labels.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step state: 1 = Phone, 2 = Verify, 3 = Details
  const [step, setStep] = useState(1);

  // In-memory verification state (resets on refresh)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isOtpVerifiedSuccess, setIsOtpVerifiedSuccess] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Step 1: Phone
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Step 2: OTP
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Timers
  const [resendTimer, setResendTimer] = useState(30);
  const [expiryTimer, setExpiryTimer] = useState(120);
  const [isExpired, setIsExpired] = useState(false);
  const [isMaxAttempts, setIsMaxAttempts] = useState(false);

  // Step 3: Registration
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    terms: false
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    terms: false
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    terms: ''
  });

  const [emailSuggestion, setEmailSuggestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [formServerError, setFormServerError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredFirstName, setRegisteredFirstName] = useState('');

  // Refs for keyboard navigation
  const phoneInputRef = useRef(null);
  const otpInputRefs = useRef([]);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const termsRef = useRef(null);

  // Step 3 can never render unless phone is verified in memory
  const activeStep = step === 3 && !isPhoneVerified ? 1 : step;

  // 30s resend timer
  useEffect(() => {
    let interval = null;
    if (activeStep === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeStep, resendTimer]);

  // 2-minute expiry timer
  useEffect(() => {
    let interval = null;
    if (activeStep === 2 && expiryTimer > 0) {
      interval = setInterval(() => {
        setExpiryTimer((prev) => {
          if (prev <= 1) {
            setIsExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeStep, expiryTimer]);

  // Focus management
  useEffect(() => {
    if (activeStep === 1) {
      phoneInputRef.current?.focus();
    } else if (activeStep === 2) {
      otpInputRefs.current[0]?.focus();
    } else if (activeStep === 3 && !registrationSuccess) {
      firstNameRef.current?.focus();
    }
  }, [activeStep, registrationSuccess]);

  // Validation
  const validatePhoneNumber = (num) => {
    const cleaned = num.replace(/\D/g, '');
    if (!cleaned) return 'Enter your 10-digit mobile number.';
    if (cleaned.length !== 10) return 'Mobile number must be exactly 10 digits.';
    if (!/^[6-9]/.test(cleaned)) return 'Mobile number must start with 6, 7, 8 or 9.';
    return '';
  };

  // Step 1: Submit Phone
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const error = validatePhoneNumber(phone);
    if (error) {
      setPhoneError(error);
      phoneInputRef.current?.focus();
      return;
    }
    setPhoneError('');
    setSendingOtp(true);

    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setDemoOtp(res.otp);
        setStep(2);
        setResendTimer(30);
        setExpiryTimer(120);
        setIsExpired(false);
        setIsMaxAttempts(false);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpError('');
      }
    } catch {
      setPhoneError('Unable to send code right now. Try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: OTP Handlers
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    const char = cleaned.slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);
    setOtpError('');

    if (index < 5 && char) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
        otpInputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...otpDigits];
        updated[index] = '';
        setOtpDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      setOtpError('');
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setSendingOtp(true);
    setOtpError('');

    try {
      const res = await resendOtp(phone);
      if (res.success) {
        setDemoOtp(res.otp);
        setOtpDigits(['', '', '', '', '', '']);
        setResendTimer(30);
        setExpiryTimer(120);
        setIsExpired(false);
        setIsMaxAttempts(false);
        otpInputRefs.current[0]?.focus();
      }
    } catch {
      setOtpError('Failed to resend code. Try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleAutofill = () => {
    if (demoOtp && demoOtp.length === 6) {
      setOtpDigits(demoOtp.split(''));
      setOtpError('');
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length !== 6) {
      setOtpError('Enter all 6 digits of the verification code.');
      return;
    }
    if (isExpired) {
      setOtpError('This code has expired. Request a new code.');
      return;
    }
    if (isMaxAttempts) {
      setOtpError('Maximum attempts reached. Request a new code.');
      return;
    }

    setVerifying(true);
    setOtpError('');

    try {
      const res = await verifyOtp(phone, enteredOtp);
      if (res.success) {
        setIsPhoneVerified(true);
        setIsOtpVerifiedSuccess(true);

        const userCheck = await checkUserExists(phone);

        if (userCheck.exists) {
          setIsExistingUser(true);
          setTimeout(() => {
            login(phone, userCheck.user);
            navigate('/dashboard');
          }, 500);
        } else {
          setIsExistingUser(false);
          setTimeout(() => {
            setIsOtpVerifiedSuccess(false);
            setStep(3);
          }, 500);
        }
      } else {
        if (res.error === 'MAX_ATTEMPTS') setIsMaxAttempts(true);
        if (res.error === 'EXPIRED') setIsExpired(true);
        setOtpError(res.message);
      }
    } catch {
      setOtpError('Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Step 3: Register Handlers
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formServerError) setFormServerError('');

    if (touched[field]) {
      if (field === 'firstName') {
        setErrors((prev) => ({ ...prev, firstName: validateName(value, 'First name') }));
      } else if (field === 'lastName') {
        setErrors((prev) => ({ ...prev, lastName: validateName(value, 'Last name') }));
      } else if (field === 'email') {
        const result = validateEmail(value);
        setErrors((prev) => ({ ...prev, email: result.error }));
        setEmailSuggestion(result.suggestion);
      } else if (field === 'terms') {
        setErrors((prev) => ({ ...prev, terms: validateTerms(value) }));
      }
    }
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'firstName') {
      const cap = capitalizeWords(formData.firstName);
      setFormData((prev) => ({ ...prev, firstName: cap }));
      setErrors((prev) => ({ ...prev, firstName: validateName(cap, 'First name') }));
    } else if (field === 'lastName') {
      const cap = capitalizeWords(formData.lastName);
      setFormData((prev) => ({ ...prev, lastName: cap }));
      setErrors((prev) => ({ ...prev, lastName: validateName(cap, 'Last name') }));
    } else if (field === 'email') {
      const lower = (formData.email || '').trim().toLowerCase();
      setFormData((prev) => ({ ...prev, email: lower }));
      const result = validateEmail(lower);
      setErrors((prev) => ({ ...prev, email: result.error }));
      setEmailSuggestion(result.suggestion);
    }
  };

  const applyEmailSuggestion = () => {
    if (emailSuggestion) {
      setFormData((prev) => ({ ...prev, email: emailSuggestion }));
      setErrors((prev) => ({ ...prev, email: '' }));
      setEmailSuggestion(null);
      emailRef.current?.focus();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const fnErr = validateName(formData.firstName, 'First name');
    const lnErr = validateName(formData.lastName, 'Last name');
    const emailResult = validateEmail(formData.email);
    const termsErr = validateTerms(formData.terms);

    const newErrors = {
      firstName: fnErr,
      lastName: lnErr,
      email: emailResult.error,
      terms: termsErr
    };

    setErrors(newErrors);
    setEmailSuggestion(emailResult.suggestion);
    setTouched({ firstName: true, lastName: true, email: true, terms: true });

    if (fnErr || lnErr || emailResult.error || termsErr) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);

      if (fnErr) firstNameRef.current?.focus();
      else if (lnErr) lastNameRef.current?.focus();
      else if (emailResult.error) emailRef.current?.focus();
      else if (termsErr) termsRef.current?.focus();
      return;
    }

    setFormServerError('');
    setIsSubmitting(true);

    try {
      const res = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone
      });

      if (res.success) {
        setRegisteredFirstName(res.user.firstName);
        setRegistrationSuccess(true);

        setTimeout(() => {
          login(phone, res.user);
          navigate('/dashboard');
        }, 1200);
      } else {
        if (res.error === 'EMAIL_EXISTS') {
          setErrors((prev) => ({ ...prev, email: res.message }));
          emailRef.current?.focus();
        } else {
          setFormServerError(res.message || 'Registration failed. Try again.');
        }
      }
    } catch {
      setFormServerError('Service is unavailable right now. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullOtpEntered = otpDigits.every((d) => d !== '');

  const stepsConfig = [
    { number: 1, label: 'Phone' },
    { number: 2, label: 'Verify' },
    { number: 3, label: 'Details' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F4] flex flex-col lg:flex-row">
      {/* DESKTOP LEFT PANEL: Brand identity */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0B4F6C] text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-shield-halved text-2xl text-white"></i>
            <span className="text-2xl font-semibold tracking-tight">FinPulse</span>
          </div>

          <div className="mt-28 max-w-sm">
            <h1 className="text-3xl font-semibold tracking-tight leading-snug">
              See your cards, loans and policies in one place.
            </h1>
            <p className="mt-4 text-[#E3EEF3] text-[15px] leading-relaxed">
              Monitor payments due this week, track your credit score, and manage active loans without switching between banking apps.
            </p>
          </div>
        </div>

        <div className="text-xs text-[#E3EEF3]/70">
          <p>Bank-grade encryption • Regulated partner integrations</p>
        </div>
      </div>

      {/* RIGHT PANEL: Form card on chalk */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div
          className={`w-full max-w-md bg-white border border-[#DDE2E0] rounded-[8px] p-6 sm:p-8 ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* Mobile brand mark */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-[4px] bg-[#0B4F6C] text-white flex items-center justify-center text-sm">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <span className="text-base font-semibold text-[#16232B] block leading-tight">
                FinPulse
              </span>
              <span className="text-xs text-[#5B6B73] block">
                Cards, loans and policies
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="mb-6 pb-4 border-b border-[#DDE2E0]">
            <div className="flex items-center justify-between text-xs">
              {stepsConfig.map((s, index) => {
                const isCompleted = activeStep > s.number;
                const isCurrent = activeStep === s.number;

                return (
                  <div key={s.number} className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-[4px] flex items-center justify-center text-[11px] font-semibold tabular-nums ${
                        isCompleted
                          ? 'bg-[#1F7A4D] text-white'
                          : isCurrent
                          ? 'bg-[#0B4F6C] text-white'
                          : 'bg-[#F5F6F4] text-[#5B6B73] border border-[#DDE2E0]'
                      }`}
                    >
                      {isCompleted ? <i className="fa-solid fa-check text-[10px]"></i> : s.number}
                    </span>
                    <span
                      className={`font-medium ${
                        isCurrent
                          ? 'text-[#0B4F6C] font-semibold'
                          : isCompleted
                          ? 'text-[#16232B]'
                          : 'text-[#5B6B73]'
                      }`}
                    >
                      {s.label}
                    </span>
                    {index < stepsConfig.length - 1 && (
                      <span className="text-[#DDE2E0] mx-1">/</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 1: Phone */}
          {activeStep === 1 && (
            <div className="animate-step-fade">
              <h2 className="text-[22px] font-semibold text-[#16232B] tracking-tight mb-1">
                Enter mobile number
              </h2>
              <p className="text-[13px] text-[#5B6B73] mb-5">
                We will send a 6-digit verification code to your mobile number.
              </p>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="phone-input"
                    className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                  >
                    Mobile number
                  </label>

                  <div className="relative flex items-center">
                    <div className="absolute left-0 inset-y-0 pl-3 flex items-center pointer-events-none text-[#5B6B73] text-[13px] font-medium border-r border-[#DDE2E0] pr-3 my-2 tabular-nums">
                      +91
                    </div>
                    <input
                      ref={phoneInputRef}
                      id="phone-input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        setPhone(cleaned);
                        if (phoneError) setPhoneError('');
                      }}
                      placeholder="98765 43210"
                      className={`w-full h-[48px] pl-16 pr-3 text-[15px] rounded-[4px] border tabular-nums focus:outline-none ${
                        phoneError
                          ? 'border-[#B3261E] bg-[#B3261E]/5 focus:border-[#B3261E]'
                          : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                      }`}
                      aria-invalid={!!phoneError}
                      aria-describedby={phoneError ? 'phone-error' : undefined}
                    />
                  </div>

                  {phoneError ? (
                    <p
                      id="phone-error"
                      role="alert"
                      className="text-[13px] text-[#B3261E] mt-1.5 flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-circle-exclamation text-xs"></i>
                      <span>{phoneError}</span>
                    </p>
                  ) : (
                    <p className="text-[13px] text-[#5B6B73] mt-1.5">
                      Standard SMS rates apply.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full h-[44px] bg-[#0B4F6C] hover:bg-[#083E54] text-white font-medium text-[15px] rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#0B4F6C] focus:ring-offset-2"
                >
                  {sendingOtp ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin text-sm"></i>
                      <span>Sending code...</span>
                    </>
                  ) : (
                    <span>Send OTP</span>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('registeredUsers');
                      setPhone('');
                      setPhoneError('');
                    }}
                    className="text-[12px] text-[#0B4F6C] hover:underline cursor-pointer"
                  >
                    Reset saved users to test registration
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Verify code */}
          {activeStep === 2 && (
            <div className="animate-step-fade">
              {isOtpVerifiedSuccess ? (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 mb-3 rounded-full bg-[#1F7A4D]/10 text-[#1F7A4D] flex items-center justify-center text-xl">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#16232B]">
                    Mobile verified
                  </h3>
                  <p className="text-[13px] text-[#5B6B73] mt-1">
                    {isExistingUser
                      ? 'Loading your dashboard...'
                      : 'Taking you to registration details...'}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-[22px] font-semibold text-[#16232B] tracking-tight">
                      Verify code
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtpError('');
                      }}
                      className="text-[13px] text-[#0B4F6C] hover:underline cursor-pointer"
                    >
                      Change number
                    </button>
                  </div>

                  <p className="text-[13px] text-[#5B6B73] mb-4">
                    Sent to <strong className="text-[#16232B] tabular-nums">+91 {phone}</strong>
                  </p>

                  {/* Demo OTP Banner */}
                  {demoOtp && (
                    <div className="p-3 rounded-[4px] bg-[#E3EEF3] border border-[#DDE2E0] text-[#0B4F6C] mb-5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] font-medium text-[#5B6B73] block">
                          Demo OTP
                        </span>
                        <span className="text-base font-semibold tracking-widest tabular-nums text-[#0B4F6C]">
                          {demoOtp}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutofill}
                        className="px-2.5 py-1 text-xs font-medium rounded-[4px] bg-[#0B4F6C] text-white hover:bg-[#083E54] cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-[13px] font-medium text-[#16232B] mb-2">
                        6-digit code
                      </label>

                      <div
                        className="flex items-center gap-2 justify-between"
                        onPaste={handlePaste}
                      >
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpInputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            disabled={isExpired || isMaxAttempts}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`w-11 h-[48px] text-center text-lg font-semibold tabular-nums rounded-[4px] border focus:outline-none ${
                              digit ? 'border-[#0B4F6C]' : 'border-[#DDE2E0]'
                            } ${
                              otpError ? 'border-[#B3261E] bg-[#B3261E]/5' : 'bg-white'
                            } ${isExpired || isMaxAttempts ? 'bg-[#F5F6F4] opacity-50' : ''}`}
                            aria-label={`Digit ${index + 1}`}
                          />
                        ))}
                      </div>

                      {otpError && (
                        <p
                          role="alert"
                          className="text-[13px] text-[#B3261E] mt-2 flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-circle-exclamation text-xs"></i>
                          <span>{otpError}</span>
                        </p>
                      )}
                    </div>

                    {/* Expiry and Resend status */}
                    <div className="flex items-center justify-between text-[13px] text-[#5B6B73] pt-1">
                      <span>
                        {isExpired ? (
                          <span className="text-[#B3261E] font-medium">Code expired</span>
                        ) : (
                          <>
                            Expires in{' '}
                            <strong className="tabular-nums text-[#16232B]">
                              {Math.floor(expiryTimer / 60)}:
                              {String(expiryTimer % 60).padStart(2, '0')}
                            </strong>
                          </>
                        )}
                      </span>

                      {resendTimer > 0 ? (
                        <span className="tabular-nums">Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={sendingOtp}
                          className="text-[#0B4F6C] font-medium hover:underline cursor-pointer"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={verifying || !fullOtpEntered || isExpired || isMaxAttempts}
                      className="w-full h-[44px] bg-[#0B4F6C] hover:bg-[#083E54] text-white font-medium text-[15px] rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#0B4F6C] focus:ring-offset-2"
                    >
                      {verifying ? (
                        <>
                          <i className="fa-solid fa-spinner animate-spin text-sm"></i>
                          <span>Verifying code...</span>
                        </>
                      ) : (
                        <span>Verify & continue</span>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Details (New user registration) */}
          {activeStep === 3 && (
            <div className="animate-step-fade">
              {registrationSuccess ? (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 mb-3 rounded-full bg-[#1F7A4D]/10 text-[#1F7A4D] flex items-center justify-center text-xl">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <h2 className="text-[22px] font-semibold text-[#16232B] tracking-tight">
                    Welcome, {registeredFirstName}.
                  </h2>
                  <p className="text-[13px] text-[#5B6B73] mt-1">
                    Setting up your account...
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-[22px] font-semibold text-[#16232B] tracking-tight mb-1">
                    Create your account
                  </h2>
                  <p className="text-[13px] text-[#5B6B73] mb-4">
                    Enter your name and email to finish setting up access.
                  </p>

                  {formServerError && (
                    <div
                      role="alert"
                      className="p-3 rounded-[4px] bg-[#B3261E]/5 border border-[#B3261E] text-[#B3261E] text-[13px] flex items-center justify-between mb-4"
                    >
                      <span>{formServerError}</span>
                      <button
                        type="button"
                        onClick={handleRegisterSubmit}
                        className="font-medium underline cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {/* First & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                        >
                          First name
                        </label>
                        <input
                          ref={firstNameRef}
                          id="firstName"
                          type="text"
                          autoComplete="given-name"
                          autoCapitalize="words"
                          value={formData.firstName}
                          onChange={(e) => handleFieldChange('firstName', e.target.value)}
                          onBlur={() => handleFieldBlur('firstName')}
                          className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border focus:outline-none ${
                            errors.firstName && touched.firstName
                              ? 'border-[#B3261E] bg-[#B3261E]/5 focus:border-[#B3261E]'
                              : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                          }`}
                          aria-invalid={!!(errors.firstName && touched.firstName)}
                        />
                        {errors.firstName && touched.firstName && (
                          <p role="alert" className="text-[13px] text-[#B3261E] mt-1">
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                        >
                          Last name
                        </label>
                        <input
                          ref={lastNameRef}
                          id="lastName"
                          type="text"
                          autoComplete="family-name"
                          autoCapitalize="words"
                          value={formData.lastName}
                          onChange={(e) => handleFieldChange('lastName', e.target.value)}
                          onBlur={() => handleFieldBlur('lastName')}
                          className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border focus:outline-none ${
                            errors.lastName && touched.lastName
                              ? 'border-[#B3261E] bg-[#B3261E]/5 focus:border-[#B3261E]'
                              : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                          }`}
                          aria-invalid={!!(errors.lastName && touched.lastName)}
                        />
                        {errors.lastName && touched.lastName && (
                          <p role="alert" className="text-[13px] text-[#B3261E] mt-1">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                      >
                        Email address
                      </label>
                      <input
                        ref={emailRef}
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                        className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border focus:outline-none ${
                          errors.email && touched.email
                            ? 'border-[#B3261E] bg-[#B3261E]/5 focus:border-[#B3261E]'
                            : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                        }`}
                        aria-invalid={!!(errors.email && touched.email)}
                      />

                      {errors.email && touched.email && (
                        <div className="mt-1 space-y-1">
                          <p role="alert" className="text-[13px] text-[#B3261E]">
                            {errors.email}
                          </p>
                          {emailSuggestion && (
                            <button
                              type="button"
                              onClick={applyEmailSuggestion}
                              className="text-[13px] text-[#0B4F6C] underline cursor-pointer font-medium block"
                            >
                              Did you mean {emailSuggestion}?
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Verified Mobile Number (read-only) */}
                    <div>
                      <label
                        htmlFor="verified-phone"
                        className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                      >
                        Verified mobile number
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="verified-phone"
                          type="text"
                          readOnly
                          value={`+91 ${phone}`}
                          className="w-full h-[48px] px-3 text-[15px] rounded-[4px] border border-[#DDE2E0] bg-[#E3EEF3]/40 text-[#16232B] font-medium tabular-nums cursor-default focus:outline-none"
                        />
                        <span className="absolute right-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F7A4D] bg-[#1F7A4D]/10 px-2 py-0.5 rounded-[4px]">
                          <i className="fa-solid fa-check text-[10px]"></i>
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer text-[13px] text-[#5B6B73]">
                        <input
                          ref={termsRef}
                          id="terms-checkbox"
                          type="checkbox"
                          checked={formData.terms}
                          onChange={(e) => handleFieldChange('terms', e.target.checked)}
                          onBlur={() => handleFieldBlur('terms')}
                          className="mt-1 w-4 h-4 rounded-[4px] border-[#DDE2E0] text-[#0B4F6C] focus:ring-[#0B4F6C] cursor-pointer"
                        />
                        <span>
                          I agree to the Terms of Service and Privacy Policy.
                        </span>
                      </label>

                      {errors.terms && touched.terms && (
                        <p role="alert" className="text-[13px] text-[#B3261E] mt-1">
                          {errors.terms}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[44px] bg-[#0B4F6C] hover:bg-[#083E54] text-white font-medium text-[15px] rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#0B4F6C] focus:ring-offset-2"
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fa-solid fa-spinner animate-spin text-sm"></i>
                          <span>Creating account...</span>
                        </>
                      ) : (
                        <span>Create account</span>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
