/**
 * Loan required documents configuration driven by loan type.
 * Types: personal, home, auto, instant.
 * Each document item: { id, label, required, help }.
 */

export const loanDocuments = {
  personal: [
    {
      id: 'pan',
      label: 'PAN Card',
      required: true,
      help: 'Clear front copy of PAN card for KYC and credit score verification.'
    },
    {
      id: 'aadhaar',
      label: 'Aadhaar Card',
      required: true,
      help: 'Front and back copy of Aadhaar card for identity & address verification.'
    },
    {
      id: 'salary_slips',
      label: 'Last 3 Months Salary Slips',
      required: true,
      help: 'Official monthly salary slips with employer name and stamp/digital sign.'
    },
    {
      id: 'bank_statement',
      label: '6 Months Bank Statement',
      required: true,
      help: 'Salary bank account statement showing monthly income credits (PDF).'
    },
    {
      id: 'employment_proof',
      label: 'Employment Proof',
      required: false,
      help: 'Employee ID card, official appointment letter, or HR verification mail.'
    }
  ],

  home: [
    {
      id: 'pan',
      label: 'PAN Card',
      required: true,
      help: 'Front copy of PAN card for mandatory tax and KYC identification.'
    },
    {
      id: 'aadhaar',
      label: 'Aadhaar Card',
      required: true,
      help: 'Front and back copy of Aadhaar card for residence verification.'
    },
    {
      id: 'salary_slips',
      label: 'Last 3 Months Salary Slips',
      required: true,
      help: 'Latest 3 months salary slips showing gross and net earnings.'
    },
    {
      id: 'bank_statement',
      label: '6 Months Bank Statement',
      required: true,
      help: 'Past 6 months operative bank account statement in PDF format.'
    },
    {
      id: 'employment_proof',
      label: 'Employment Proof',
      required: false,
      help: 'Current corporate employee ID badge or service confirmation letter.'
    },
    {
      id: 'property_papers',
      label: 'Property Papers',
      required: true,
      help: 'Registered title deeds, chain link documents, or allotment letter.'
    },
    {
      id: 'sale_agreement',
      label: 'Sale Agreement',
      required: true,
      help: 'Executed Agreement to Sell / Builder-Buyer Contract copy.'
    },
    {
      id: 'form16_itr',
      label: 'Form 16 / ITR (2 Years)',
      required: true,
      help: 'Past 2 consecutive financial years Form 16 or Income Tax Return acknowledgements.'
    },
    {
      id: 'builder_noc',
      label: 'Builder NOC',
      required: false,
      help: 'No Objection Certificate (NOC) and approved layout permissions from builder.'
    }
  ],

  auto: [
    {
      id: 'pan',
      label: 'PAN Card',
      required: true,
      help: 'Valid PAN card copy for vehicle finance KYC and credit reporting.'
    },
    {
      id: 'aadhaar',
      label: 'Aadhaar Card',
      required: true,
      help: 'Government issued Aadhaar card copy for permanent address proof.'
    },
    {
      id: 'income_proof',
      label: 'Income Proof',
      required: true,
      help: 'Latest 3 months salary slips or last 2 years audited ITR computation.'
    },
    {
      id: 'bank_statement',
      label: 'Bank Statement (6 Months)',
      required: true,
      help: 'Primary salary / current bank account statement for past 6 months.'
    },
    {
      id: 'vehicle_quotation',
      label: 'Vehicle Quotation / Proforma Invoice',
      required: true,
      help: 'Official vehicle dealer proforma invoice mentioning ex-showroom and on-road prices.'
    }
  ],

  instant: [
    {
      id: 'pan',
      label: 'PAN Card',
      required: true,
      help: 'Front photo of PAN card for instant digital underwriting.'
    },
    {
      id: 'aadhaar',
      label: 'Aadhaar Card',
      required: true,
      help: 'Aadhaar card details for instant paperless OTP based e-KYC.'
    },
    {
      id: 'selfie',
      label: 'Live Selfie Photo',
      required: true,
      help: 'Clear selfie photo taken in good lighting for real-time face authentication.'
    },
    {
      id: 'bank_statement',
      label: 'Bank Statement (3 Months)',
      required: true,
      help: 'Recent 3-month net banking e-statement PDF for algorithmic credit scoring.'
    }
  ]
};

export default loanDocuments;
