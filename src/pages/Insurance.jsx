import { useState } from 'react';
import { useInsurance } from '../context/useInsurance';
import { getInsurancePlans, buyPolicy } from '../services/insuranceApi';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils/format';

/**
 * Insurance Page Component.
 * Tabs: Health, Term, Motor, Travel.
 * Features:
 * - Quote forms with input validation per tab (non-floating inputs, 48px high, 4px radius)
 * - Comparison table with right-aligned tabular amounts and 4px status badges
 * - Buy confirmation modal and instant policy issuance into in-memory InsuranceContext
 * - My policies section with dense statement rows and renewal countdowns
 * - Flat 1px borders, sentence case, no decorative drop shadows
 */
export default function Insurance() {
  const { myPolicies, addPolicy } = useInsurance();

  const [activeTab, setActiveTab] = useState('health');
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  // Health Form State
  const [healthForm, setHealthForm] = useState({
    age: 32,
    pincode: '560038',
    preExisting: 'no'
  });

  // Term Form State
  const [termForm, setTermForm] = useState({
    age: 30,
    annualIncome: 1200000,
    smoker: 'no',
    coverAmount: 10000000
  });

  // Motor Form State
  const [motorForm, setMotorForm] = useState({
    vehicleNumber: 'KA01MJ4402',
    vehicleType: 'car',
    pincode: '560038'
  });

  // Travel Form State
  const [travelForm, setTravelForm] = useState({
    destination: 'europe',
    days: 14,
    travellers: 2
  });

  const [formErrors, setFormErrors] = useState({});

  // Buy Modal State
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);
  const [buying, setBuying] = useState(false);
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');

  // Tab switching
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFormErrors({});
    setPlans([]);
    setHasQueried(false);
  };

  // Validation
  const validateCurrentForm = () => {
    const errs = {};

    if (activeTab === 'health') {
      if (!healthForm.age || healthForm.age < 18 || healthForm.age > 85) {
        errs.age = 'Age must be between 18 and 85 years.';
      }
      if (!/^\d{6}$/.test(healthForm.pincode)) {
        errs.pincode = 'PIN code must be exactly 6 digits.';
      }
    } else if (activeTab === 'term') {
      if (!termForm.age || termForm.age < 18 || termForm.age > 65) {
        errs.age = 'Age must be between 18 and 65 years.';
      }
      if (!termForm.annualIncome || termForm.annualIncome < 200000) {
        errs.annualIncome = 'Minimum annual income of ₹2,00,000 required.';
      }
    } else if (activeTab === 'motor') {
      const regRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;
      const cleanedReg = motorForm.vehicleNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (!regRegex.test(cleanedReg)) {
        errs.vehicleNumber = 'Enter standard registration number (e.g. KA01MJ4402).';
      }
      if (!/^\d{6}$/.test(motorForm.pincode)) {
        errs.pincode = 'PIN code must be exactly 6 digits.';
      }
    } else if (activeTab === 'travel') {
      if (!travelForm.days || travelForm.days < 1 || travelForm.days > 180) {
        errs.days = 'Duration must be between 1 and 180 days.';
      }
      if (!travelForm.travellers || travelForm.travellers < 1 || travelForm.travellers > 10) {
        errs.travellers = 'Travellers must be between 1 and 10.';
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit quote query
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentForm()) return;

    setLoadingPlans(true);
    let currentPayload = {};
    if (activeTab === 'health') currentPayload = healthForm;
    else if (activeTab === 'term') currentPayload = termForm;
    else if (activeTab === 'motor') currentPayload = motorForm;
    else if (activeTab === 'travel') currentPayload = travelForm;

    try {
      const generatedPlans = await getInsurancePlans(activeTab, currentPayload);
      setPlans(generatedPlans);
      setHasQueried(true);
    } catch {
      setToastMessage('Could not retrieve quotes. Try again.');
    } finally {
      setLoadingPlans(false);
    }
  };

  // Buy policy
  const handleConfirmBuy = async () => {
    if (!selectedPlanToBuy) return;
    setBuying(true);

    try {
      const result = await buyPolicy({ ...selectedPlanToBuy, category: activeTab });

      addPolicy({
        id: `pol-${Date.now()}`,
        type: `${selectedPlanToBuy.planName} (${activeTab})`,
        insurer: selectedPlanToBuy.insurer,
        policyNumber: result.policyNumber,
        sumInsured: selectedPlanToBuy.sumInsured,
        premium: selectedPlanToBuy.premium,
        expiryDate: result.expiryDate
      });

      setPurchaseSuccessMsg(
        `Policy ${result.policyNumber} issued. Added to your active policies below.`
      );

      setTimeout(() => {
        setSelectedPlanToBuy(null);
        setBuying(false);
        setPurchaseSuccessMsg('');
      }, 2000);
    } catch {
      setBuying(false);
    }
  };

  const handleDownloadPolicy = (policy) => {
    setToastMessage(`Policy document for ${policy.policyNumber} downloaded.`);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
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

      {/* Page Header */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#16232B] tracking-tight">
          Insurance marketplace
        </h1>
        <p className="text-[13px] text-[#5B6B73]">
          Compare claim settlement ratios (CSR), calculate annual premiums, and manage active coverages.
        </p>
      </div>

      {/* 1. TABBED QUOTE GENERATOR */}
      <div className="bg-white rounded-[8px] border border-[#DDE2E0] overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#DDE2E0] bg-[#F5F6F4]">
          {[
            { id: 'health', label: 'Health insurance', icon: 'fa-solid fa-heart-pulse' },
            { id: 'term', label: 'Term life cover', icon: 'fa-solid fa-umbrella' },
            { id: 'motor', label: 'Motor insurance', icon: 'fa-solid fa-car-burst' },
            { id: 'travel', label: 'Travel protection', icon: 'fa-solid fa-plane-departure' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-3 px-4 text-[13px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-[#0B4F6C] text-[#0B4F6C] bg-white font-semibold'
                    : 'border-transparent text-[#5B6B73] hover:text-[#16232B]'
                }`}
              >
                <i className={`${tab.icon} text-xs`}></i>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Form Container */}
        <div className="p-5 sm:p-6">
          <form onSubmit={handleQuoteSubmit} className="space-y-4">
            <div className="pb-3 border-b border-[#DDE2E0]">
              <h2 className="text-[15px] font-semibold text-[#16232B]">
                {activeTab === 'health' && 'Health insurance parameters'}
                {activeTab === 'term' && 'Term life policy parameters'}
                {activeTab === 'motor' && 'Vehicle registration details'}
                {activeTab === 'travel' && 'Travel itinerary details'}
              </h2>
              <p className="text-[13px] text-[#5B6B73]">
                Enter information to compute premium quotes across IRDAI-registered underwriters.
              </p>
            </div>

            {/* Health Form Fields */}
            {activeTab === 'health' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="h-age" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Age of primary insured
                  </label>
                  <input
                    id="h-age"
                    type="number"
                    min="18"
                    max="85"
                    value={healthForm.age}
                    onChange={(e) => setHealthForm({ ...healthForm, age: e.target.value })}
                    className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border tabular-nums focus:outline-none ${
                      formErrors.age ? 'border-[#B3261E] bg-[#B3261E]/5' : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                    }`}
                  />
                  {formErrors.age && <p className="text-[13px] text-[#B3261E] mt-1">{formErrors.age}</p>}
                </div>

                <div>
                  <label htmlFor="h-pin" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Residential PIN code
                  </label>
                  <input
                    id="h-pin"
                    type="text"
                    maxLength={6}
                    value={healthForm.pincode}
                    onChange={(e) => setHealthForm({ ...healthForm, pincode: e.target.value.replace(/\D/g, '') })}
                    className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border tabular-nums focus:outline-none ${
                      formErrors.pincode ? 'border-[#B3261E] bg-[#B3261E]/5' : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                    }`}
                  />
                  {formErrors.pincode && <p className="text-[13px] text-[#B3261E] mt-1">{formErrors.pincode}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Pre-existing medical conditions
                  </label>
                  <div className="flex items-center gap-4 h-[48px]">
                    <label className="flex items-center gap-1.5 text-[13px] text-[#16232B] cursor-pointer">
                      <input
                        type="radio"
                        name="preExisting"
                        value="no"
                        checked={healthForm.preExisting === 'no'}
                        onChange={(e) => setHealthForm({ ...healthForm, preExisting: e.target.value })}
                        className="text-[#0B4F6C] focus:ring-[#0B4F6C]"
                      />
                      <span>No</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[13px] text-[#16232B] cursor-pointer">
                      <input
                        type="radio"
                        name="preExisting"
                        value="yes"
                        checked={healthForm.preExisting === 'yes'}
                        onChange={(e) => setHealthForm({ ...healthForm, preExisting: e.target.value })}
                        className="text-[#0B4F6C] focus:ring-[#0B4F6C]"
                      />
                      <span>Yes (Diabetes / BP)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Term Form Fields */}
            {activeTab === 'term' && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="t-age" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Age
                  </label>
                  <input
                    id="t-age"
                    type="number"
                    min="18"
                    max="65"
                    value={termForm.age}
                    onChange={(e) => setTermForm({ ...termForm, age: e.target.value })}
                    className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border tabular-nums focus:outline-none ${
                      formErrors.age ? 'border-[#B3261E] bg-[#B3261E]/5' : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                    }`}
                  />
                  {formErrors.age && <p className="text-[13px] text-[#B3261E] mt-1">{formErrors.age}</p>}
                </div>

                <div>
                  <label htmlFor="t-income" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Annual income (₹)
                  </label>
                  <input
                    id="t-income"
                    type="number"
                    min="200000"
                    step="50000"
                    value={termForm.annualIncome}
                    onChange={(e) => setTermForm({ ...termForm, annualIncome: Number(e.target.value) })}
                    className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border tabular-nums focus:outline-none ${
                      formErrors.annualIncome ? 'border-[#B3261E] bg-[#B3261E]/5' : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                    }`}
                  />
                  {formErrors.annualIncome && <p className="text-[13px] text-[#B3261E] mt-1">{formErrors.annualIncome}</p>}
                </div>

                <div>
                  <label htmlFor="t-cover" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Sum insured cover
                  </label>
                  <select
                    id="t-cover"
                    value={termForm.coverAmount}
                    onChange={(e) => setTermForm({ ...termForm, coverAmount: Number(e.target.value) })}
                    className="w-full h-[48px] px-3 text-[15px] rounded-[4px] border border-[#DDE2E0] bg-white focus:outline-none focus:border-[#0B4F6C]"
                  >
                    <option value={5000000}>₹50 Lakhs</option>
                    <option value={10000000}>₹1 Crore</option>
                    <option value={20000000}>₹2 Crores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Tobacco or smoking habit
                  </label>
                  <div className="flex items-center gap-4 h-[48px]">
                    <label className="flex items-center gap-1.5 text-[13px] text-[#16232B] cursor-pointer">
                      <input
                        type="radio"
                        name="smoker"
                        value="no"
                        checked={termForm.smoker === 'no'}
                        onChange={(e) => setTermForm({ ...termForm, smoker: e.target.value })}
                        className="text-[#0B4F6C]"
                      />
                      <span>Non-smoker</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-[13px] text-[#16232B] cursor-pointer">
                      <input
                        type="radio"
                        name="smoker"
                        value="yes"
                        checked={termForm.smoker === 'yes'}
                        onChange={(e) => setTermForm({ ...termForm, smoker: e.target.value })}
                        className="text-[#0B4F6C]"
                      />
                      <span>Smoker</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Motor Form Fields */}
            {activeTab === 'motor' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="m-reg" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Registration number
                  </label>
                  <input
                    id="m-reg"
                    type="text"
                    value={motorForm.vehicleNumber}
                    onChange={(e) => setMotorForm({ ...motorForm, vehicleNumber: e.target.value.toUpperCase() })}
                    placeholder="KA01MJ4402"
                    className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border tabular-nums uppercase focus:outline-none ${
                      formErrors.vehicleNumber ? 'border-[#B3261E] bg-[#B3261E]/5' : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                    }`}
                  />
                  {formErrors.vehicleNumber && <p className="text-[13px] text-[#B3261E] mt-1">{formErrors.vehicleNumber}</p>}
                </div>

                <div>
                  <label htmlFor="m-type" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Vehicle category
                  </label>
                  <select
                    id="m-type"
                    value={motorForm.vehicleType}
                    onChange={(e) => setMotorForm({ ...motorForm, vehicleType: e.target.value })}
                    className="w-full h-[48px] px-3 text-[15px] rounded-[4px] border border-[#DDE2E0] bg-white focus:outline-none focus:border-[#0B4F6C]"
                  >
                    <option value="car">Private 4-wheeler (Car)</option>
                    <option value="bike">Two-wheeler (Bike / Scooter)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="m-pin" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Registration RTO PIN code
                  </label>
                  <input
                    id="m-pin"
                    type="text"
                    maxLength={6}
                    value={motorForm.pincode}
                    onChange={(e) => setMotorForm({ ...motorForm, pincode: e.target.value.replace(/\D/g, '') })}
                    className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border tabular-nums focus:outline-none ${
                      formErrors.pincode ? 'border-[#B3261E] bg-[#B3261E]/5' : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                    }`}
                  />
                  {formErrors.pincode && <p className="text-[13px] text-[#B3261E] mt-1">{formErrors.pincode}</p>}
                </div>
              </div>
            )}

            {/* Travel Form Fields */}
            {activeTab === 'travel' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="tr-dest" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Destination region
                  </label>
                  <select
                    id="tr-dest"
                    value={travelForm.destination}
                    onChange={(e) => setTravelForm({ ...travelForm, destination: e.target.value })}
                    className="w-full h-[48px] px-3 text-[15px] rounded-[4px] border border-[#DDE2E0] bg-white focus:outline-none focus:border-[#0B4F6C]"
                  >
                    <option value="europe">Schengen and Europe</option>
                    <option value="usa_canada">USA, Canada and Americas</option>
                    <option value="asia">Asia and Middle East</option>
                    <option value="worldwide">Worldwide comprehensive</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tr-days" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Trip duration (days)
                  </label>
                  <input
                    id="tr-days"
                    type="number"
                    min="1"
                    max="180"
                    value={travelForm.days}
                    onChange={(e) => setTravelForm({ ...travelForm, days: Number(e.target.value) })}
                    className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border tabular-nums focus:outline-none ${
                      formErrors.days ? 'border-[#B3261E] bg-[#B3261E]/5' : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                    }`}
                  />
                  {formErrors.days && <p className="text-[13px] text-[#B3261E] mt-1">{formErrors.days}</p>}
                </div>

                <div>
                  <label htmlFor="tr-trav" className="block text-[13px] font-medium text-[#16232B] mb-1.5">
                    Number of travellers
                  </label>
                  <input
                    id="tr-trav"
                    type="number"
                    min="1"
                    max="10"
                    value={travelForm.travellers}
                    onChange={(e) => setTravelForm({ ...travelForm, travellers: Number(e.target.value) })}
                    className={`w-full h-[48px] px-3 text-[15px] rounded-[4px] border tabular-nums focus:outline-none ${
                      formErrors.travellers ? 'border-[#B3261E] bg-[#B3261E]/5' : 'border-[#DDE2E0] bg-white focus:border-[#0B4F6C]'
                    }`}
                  />
                  {formErrors.travellers && <p className="text-[13px] text-[#B3261E] mt-1">{formErrors.travellers}</p>}
                </div>
              </div>
            )}

            {/* Submit Quote Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loadingPlans}
                className="h-[44px] px-6 bg-[#0B4F6C] hover:bg-[#083E54] text-white font-medium text-[15px] rounded-[8px] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60 focus:ring-2 focus:ring-[#0B4F6C] focus:ring-offset-2"
              >
                {loadingPlans ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin text-sm"></i>
                    <span>Calculating quotes...</span>
                  </>
                ) : (
                  <span>Get quotes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 2. COMPARISON TABLE */}
      {hasQueried && (
        <section className="bg-white rounded-[8px] border border-[#DDE2E0] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDE2E0]">
            <div>
              <h2 className="text-[17px] font-semibold text-[#16232B] tracking-tight">
                Recommended policy comparison
              </h2>
              <p className="text-[13px] text-[#5B6B73]">
                Comparing 4 partner plans sorted by underwriting benefits.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#DDE2E0] text-[#5B6B73] text-[11px] uppercase tracking-wider font-medium">
                  <th className="py-2.5 font-medium">Insurer and plan</th>
                  <th className="py-2.5 font-medium text-right">Sum insured</th>
                  <th className="py-2.5 font-medium text-right">CSR</th>
                  <th className="py-2.5 font-medium">Cashless network</th>
                  <th className="py-2.5 font-medium text-right">Waiting period</th>
                  <th className="py-2.5 font-medium text-right">Annual premium</th>
                  <th className="py-2.5 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2E0]">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-[#F5F6F4]/60 transition-colors">
                    <td className="py-3 font-medium text-[#16232B]">
                      <div>
                        <span className="font-semibold text-[#16232B] block">{plan.insurer}</span>
                        <span className="text-[11px] text-[#5B6B73] block">{plan.planName}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          {plan.isBestCsr && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[4px] text-[10px] font-medium bg-[#1F7A4D]/10 text-[#1F7A4D]">
                              Highest CSR
                            </span>
                          )}
                          {plan.isLowestPremium && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[4px] text-[10px] font-medium bg-[#0B4F6C]/10 text-[#0B4F6C]">
                              Lowest premium
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium text-[#16232B] tabular-nums whitespace-nowrap">
                      {formatCurrency(plan.sumInsured)}
                    </td>
                    <td className="py-3 text-right font-medium text-[#16232B] tabular-nums whitespace-nowrap">
                      {plan.claimSettlementRatio}%
                    </td>
                    <td className="py-3 text-[#5B6B73] whitespace-nowrap">
                      {plan.cashlessHospitals}
                    </td>
                    <td className="py-3 text-right text-[#5B6B73] whitespace-nowrap">
                      {plan.waitingPeriod}
                    </td>
                    <td className="py-3 text-right font-semibold text-[#16232B] tabular-nums whitespace-nowrap">
                      {formatCurrency(plan.premium)}
                    </td>
                    <td className="py-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanToBuy(plan)}
                        className="h-[36px] px-4 bg-[#0B4F6C] hover:bg-[#083E54] text-white font-medium text-[13px] rounded-[4px] transition-colors cursor-pointer"
                      >
                        Buy policy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3. ACTIVE POLICIES TRACKER */}
      <section className="bg-white rounded-[8px] border border-[#DDE2E0] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDE2E0]">
          <div>
            <h2 className="text-[17px] font-semibold text-[#16232B] tracking-tight">
              Active policies
            </h2>
            <p className="text-[13px] text-[#5B6B73]">
              Active life, health, auto and travel coverages with renewal dates.
            </p>
          </div>
          <span className="text-[13px] text-[#5B6B73] tabular-nums">
            {myPolicies.length} coverages
          </span>
        </div>

        {myPolicies.length === 0 ? (
          <div className="text-center py-8 text-[13px] text-[#5B6B73]">
            No active insurance policies enrolled.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#DDE2E0] text-[#5B6B73] text-[11px] uppercase tracking-wider font-medium">
                  <th className="py-2.5 font-medium">Policy number</th>
                  <th className="py-2.5 font-medium">Coverage</th>
                  <th className="py-2.5 font-medium">Insurer</th>
                  <th className="py-2.5 font-medium text-right">Sum insured</th>
                  <th className="py-2.5 font-medium text-right">Annual premium</th>
                  <th className="py-2.5 font-medium">Expiry / Renewal</th>
                  <th className="py-2.5 font-medium text-center">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE2E0]">
                {myPolicies.map((pol) => {
                  const daysLeft = getDaysRemaining(pol.expiryDate);
                  const isExpired = daysLeft < 0;
                  const isDueSoon = daysLeft >= 0 && daysLeft <= 30;

                  return (
                    <tr key={pol.id} className="hover:bg-[#F5F6F4]/60 transition-colors">
                      <td className="py-3 font-mono text-[#16232B] tabular-nums font-medium whitespace-nowrap">
                        {pol.policyNumber}
                      </td>
                      <td className="py-3 text-[#16232B] font-medium">
                        {pol.type}
                      </td>
                      <td className="py-3 text-[#5B6B73]">
                        {pol.insurer}
                      </td>
                      <td className="py-3 text-right font-medium text-[#16232B] tabular-nums whitespace-nowrap">
                        {formatCurrency(pol.sumInsured)}
                      </td>
                      <td className="py-3 text-right font-medium text-[#16232B] tabular-nums whitespace-nowrap">
                        {formatCurrency(pol.premium)}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#5B6B73] tabular-nums">{formatDate(pol.expiryDate)}</span>
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[4px] text-[11px] font-medium tabular-nums ${
                              isExpired
                                ? 'bg-[#B3261E]/10 text-[#B3261E]'
                                : isDueSoon
                                ? 'bg-[#B86E00]/10 text-[#B86E00]'
                                : 'bg-[#1F7A4D]/10 text-[#1F7A4D]'
                            }`}
                          >
                            {isExpired
                              ? `Expired`
                              : isDueSoon
                              ? `${daysLeft}d left`
                              : `Active`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDownloadPolicy(pol)}
                          className="h-[32px] px-3 border border-[#DDE2E0] rounded-[4px] text-[11px] font-medium text-[#16232B] hover:bg-[#F5F6F4] cursor-pointer"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* BUY CONFIRMATION MODAL */}
      {selectedPlanToBuy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#16232B]/30"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-[8px] border border-[#DDE2E0] p-6 max-w-md w-full shadow-sm space-y-4">
            <div className="pb-3 border-b border-[#DDE2E0] flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-[#16232B]">
                Confirm policy issuance
              </h3>
              <button
                type="button"
                disabled={buying}
                onClick={() => setSelectedPlanToBuy(null)}
                className="text-[#5B6B73] hover:text-[#16232B]"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {purchaseSuccessMsg ? (
              <div className="py-4 text-center space-y-2">
                <i className="fa-solid fa-circle-check text-2xl text-[#1F7A4D]"></i>
                <p className="text-[15px] font-semibold text-[#16232B]">{purchaseSuccessMsg}</p>
              </div>
            ) : (
              <div className="space-y-3 text-[13px]">
                <div className="flex justify-between text-[#5B6B73]">
                  <span>Insurer:</span>
                  <span className="font-medium text-[#16232B]">{selectedPlanToBuy.insurer}</span>
                </div>
                <div className="flex justify-between text-[#5B6B73]">
                  <span>Plan:</span>
                  <span className="font-medium text-[#16232B]">{selectedPlanToBuy.planName}</span>
                </div>
                <div className="flex justify-between text-[#5B6B73]">
                  <span>Sum insured:</span>
                  <span className="font-semibold text-[#16232B] tabular-nums">
                    {formatCurrency(selectedPlanToBuy.sumInsured)}
                  </span>
                </div>
                <div className="flex justify-between text-[#5B6B73] pt-2 border-t border-[#DDE2E0]">
                  <span className="font-semibold text-[#16232B]">Annual premium:</span>
                  <span className="font-semibold text-[#16232B] tabular-nums text-base">
                    {formatCurrency(selectedPlanToBuy.premium)}
                  </span>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={buying}
                    onClick={() => setSelectedPlanToBuy(null)}
                    className="flex-1 h-[44px] border border-[#DDE2E0] rounded-[8px] text-[13px] font-medium text-[#16232B] hover:bg-[#F5F6F4] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={buying}
                    onClick={handleConfirmBuy}
                    className="flex-1 h-[44px] bg-[#0B4F6C] hover:bg-[#083E54] text-white font-medium text-[13px] rounded-[8px] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {buying ? 'Issuing policy...' : 'Confirm and issue'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
