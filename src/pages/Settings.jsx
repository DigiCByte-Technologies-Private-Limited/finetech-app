import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import {
  validateName,
  capitalizeWords,
  validateEmail
} from '../utils/validators';

/**
 * Settings Page Component.
 * Profile editing and residence address details.
 * Implements strict design system: 48px inputs, 44px buttons, 4px/8px radii, flat 1px borders.
 */
export default function Settings() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || (user?.name ? user.name.split(' ')[0] : ''),
    lastName: user?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : ''),
    email: user?.email || '',
    landmark: user?.landmark || '',
    area: user?.area || '',
    city: user?.city || '',
    pincode: user?.pincode || ''
  }));

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [emailSuggestion, setEmailSuggestion] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      if (field === 'firstName') {
        setErrors((prev) => ({
          ...prev,
          firstName: validateName(value, 'First name')
        }));
      } else if (field === 'lastName') {
        setErrors((prev) => ({
          ...prev,
          lastName: validateName(value, 'Last name')
        }));
      } else if (field === 'email') {
        const result = validateEmail(value);
        setErrors((prev) => ({ ...prev, email: result.error }));
        setEmailSuggestion(result.suggestion);
      }
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'firstName') {
      const cap = capitalizeWords(formData.firstName);
      setFormData((prev) => ({ ...prev, firstName: cap }));
      setErrors((prev) => ({
        ...prev,
        firstName: validateName(cap, 'First name')
      }));
    } else if (field === 'lastName') {
      const cap = capitalizeWords(formData.lastName);
      setFormData((prev) => ({ ...prev, lastName: cap }));
      setErrors((prev) => ({
        ...prev,
        lastName: validateName(cap, 'Last name')
      }));
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
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fnErr = validateName(formData.firstName, 'First name');
    const lnErr = validateName(formData.lastName, 'Last name');
    const emailRes = validateEmail(formData.email);

    const newErrors = {
      firstName: fnErr,
      lastName: lnErr,
      email: emailRes.error
    };

    setErrors(newErrors);
    setTouched({ firstName: true, lastName: true, email: true });

    if (fnErr || lnErr || emailRes.error) {
      return;
    }

    setSaving(true);
    setTimeout(() => {
      updateUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        landmark: formData.landmark.trim(),
        area: formData.area.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim()
      });
      setSaving(false);
      setToastMessage('Profile and location updated.');
      setTimeout(() => setToastMessage(''), 3500);
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="alert"
          className="fixed top-4 right-4 z-50 bg-[#16232B] text-white px-4 py-3 rounded-[8px] border border-[#DDE2E0] shadow-sm flex items-center gap-2 text-[13px]"
        >
          <i className="fa-solid fa-circle-check text-[#1F7A4D]"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#16232B] tracking-tight">
          Account settings
        </h1>
        <p className="text-[13px] text-[#5B6B73]">
          Personal profile details and registered residence address.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-[8px] border border-[#DDE2E0] p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Personal Info */}
          <div>
            <h2 className="text-[15px] font-semibold text-[#16232B] pb-2 border-b border-[#DDE2E0]">
              Personal details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label
                  htmlFor="settings-firstName"
                  className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                >
                  First name
                </label>
                <input
                  id="settings-firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border focus:outline-none ${
                    errors.firstName && touched.firstName
                      ? 'border-[#B3261E] bg-[#B3261E]/5 focus:border-[#B3261E]'
                      : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                  }`}
                  aria-invalid={!!(errors.firstName && touched.firstName)}
                />
                {errors.firstName && touched.firstName && (
                  <p className="text-[13px] text-[#B3261E] mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="settings-lastName"
                  className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                >
                  Last name
                </label>
                <input
                  id="settings-lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                  className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border focus:outline-none ${
                    errors.lastName && touched.lastName
                      ? 'border-[#B3261E] bg-[#B3261E]/5 focus:border-[#B3261E]'
                      : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                  }`}
                  aria-invalid={!!(errors.lastName && touched.lastName)}
                />
                {errors.lastName && touched.lastName && (
                  <p className="text-[13px] text-[#B3261E] mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="settings-email"
                  className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="settings-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border focus:outline-none ${
                    errors.email && touched.email
                      ? 'border-[#B3261E] bg-[#B3261E]/5 focus:border-[#B3261E]'
                      : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                  }`}
                  aria-invalid={!!(errors.email && touched.email)}
                />
                {errors.email && touched.email && (
                  <div className="mt-1 space-y-1">
                    <p className="text-[13px] text-[#B3261E]">{errors.email}</p>
                    {emailSuggestion && (
                      <button
                        type="button"
                        onClick={applyEmailSuggestion}
                        className="text-[13px] text-[#0B4F6C] underline cursor-pointer"
                      >
                        Did you mean {emailSuggestion}?
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="settings-phone"
                  className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                >
                  Mobile number
                </label>
                <div className="relative flex items-center">
                  <input
                    id="settings-phone"
                    type="text"
                    readOnly
                    value={`+91 ${user?.phone || ''}`}
                    className="w-full h-[48px] px-3 text-[15px] rounded-[4px] border border-[#DDE2E0] bg-[#E3EEF3]/40 text-[#16232B] tabular-nums font-medium cursor-default focus:outline-none"
                  />
                  <span className="absolute right-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F7A4D] bg-[#1F7A4D]/10 px-2 py-0.5 rounded-[4px]">
                    <i className="fa-solid fa-check text-[10px]"></i>
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="pt-2">
            <h2 className="text-[15px] font-semibold text-[#16232B] pb-2 border-b border-[#DDE2E0]">
              Residence location
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label
                  htmlFor="settings-landmark"
                  className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                >
                  Landmark
                </label>
                <input
                  id="settings-landmark"
                  type="text"
                  placeholder="Near Metro Station"
                  value={formData.landmark}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                  className="w-full h-[48px] px-3 text-[15px] rounded-[4px] border border-[#DDE2E0] bg-white focus:outline-none focus:border-[#0B4F6C]"
                />
              </div>

              <div>
                <label
                  htmlFor="settings-area"
                  className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                >
                  Area / Locality
                </label>
                <input
                  id="settings-area"
                  type="text"
                  placeholder="Indiranagar"
                  value={formData.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  className="w-full h-[48px] px-3 text-[15px] rounded-[4px] border border-[#DDE2E0] bg-white focus:outline-none focus:border-[#0B4F6C]"
                />
              </div>

              <div>
                <label
                  htmlFor="settings-city"
                  className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                >
                  City
                </label>
                <input
                  id="settings-city"
                  type="text"
                  placeholder="Bengaluru"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full h-[48px] px-3 text-[15px] rounded-[4px] border border-[#DDE2E0] bg-white focus:outline-none focus:border-[#0B4F6C]"
                />
              </div>

              <div>
                <label
                  htmlFor="settings-pincode"
                  className="block text-[13px] font-medium text-[#16232B] mb-1.5"
                >
                  PIN code
                </label>
                <input
                  id="settings-pincode"
                  type="text"
                  maxLength={6}
                  placeholder="560038"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full h-[48px] px-3 text-[15px] rounded-[4px] border border-[#DDE2E0] bg-white tabular-nums focus:outline-none focus:border-[#0B4F6C]"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#DDE2E0] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="h-[44px] px-6 bg-[#0B4F6C] hover:bg-[#083E54] text-white font-medium text-[15px] rounded-[8px] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60 focus:ring-2 focus:ring-[#0B4F6C] focus:ring-offset-2"
            >
              {saving ? 'Saving changes...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
