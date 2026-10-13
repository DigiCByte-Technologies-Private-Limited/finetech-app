import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loanDocuments } from '../../data/loanDocuments';
import { useLoanFlow } from '../../context/useLoanFlow';

/**
 * Step 2: Documents Checklist Component.
 * Enforces:
 * - Config-driven document checklist per loan type (personal, home, auto, instant).
 * - Hidden file input accepting pdf/jpg/png with max 5MB limit.
 * - In-memory upload storage with green tick, file name display, and remove action.
 * - "X of Y required documents added" counter.
 * - "Continue" enabled only when all required documents are uploaded.
 */
export default function StepDocuments() {
  const { type = 'personal' } = useParams();
  const navigate = useNavigate();
  const { uploadedFiles, uploadDocument, removeDocument } = useLoanFlow();

  const [fileErrors, setFileErrors] = useState({});
  const fileInputRefs = useRef({});

  // Get documents list for this loan type
  const normalizedType = type.toLowerCase();
  const docsList = loanDocuments[normalizedType] || loanDocuments.personal;

  // Calculate required documents status
  const requiredDocs = docsList.filter((doc) => doc.required);
  const totalRequired = requiredDocs.length;
  const uploadedRequiredCount = requiredDocs.filter(
    (doc) => !!uploadedFiles[doc.id]
  ).length;

  const allRequiredUploaded = uploadedRequiredCount === totalRequired;

  // Handle File Input Change
  const handleFileChange = (docId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous error for this document
    setFileErrors((prev) => ({ ...prev, [docId]: '' }));

    // Validate size (max 5 MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setFileErrors((prev) => ({
        ...prev,
        [docId]: `File size exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`
      }));
      e.target.value = '';
      return;
    }

    // Validate type (pdf, jpg, jpeg, png)
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setFileErrors((prev) => ({
        ...prev,
        [docId]: 'Only PDF, JPG, and PNG files are accepted.'
      }));
      e.target.value = '';
      return;
    }

    // Store file IN MEMORY ONLY via Context
    uploadDocument(docId, file);
    e.target.value = '';
  };

  const handleRemove = (docId) => {
    removeDocument(docId);
    setFileErrors((prev) => ({ ...prev, [docId]: '' }));
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId].value = '';
    }
  };

  return (
    <div className="bg-white rounded-[8px] border border-[#DDE2E0] p-5 sm:p-6 space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DDE2E0]">
        <div>
          <span className="text-xs font-medium text-[#5B6B73]">
            Step 2 of 5 — {normalizedType} loan
          </span>
          <h2 className="text-lg font-semibold text-[#16232B] tracking-tight mt-1">
            Required documents checklist
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B73] mt-0.5">
            Upload your verification files. PDF, JPG, or PNG files up to 5 MB are supported.
          </p>
        </div>

        {/* Counter Badge */}
        <div
          className={`px-2.5 py-1 rounded-[4px] text-xs font-medium border flex items-center gap-1.5 w-fit tabular-nums ${
            allRequiredUploaded
              ? 'bg-[#1F7A4D]/10 text-[#1F7A4D] border-[#1F7A4D]/30'
              : 'bg-[#B86E00]/10 text-[#B86E00] border-[#B86E00]/30'
          }`}
        >
          <i
            className={`fa-solid ${
              allRequiredUploaded ? 'fa-circle-check' : 'fa-clock'
            } text-xs`}
          ></i>
          <span>
            {uploadedRequiredCount} of {totalRequired} required documents added
          </span>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {docsList.map((doc) => {
          const uploadedFile = uploadedFiles[doc.id];
          const hasError = fileErrors[doc.id];

          return (
            <div
              key={doc.id}
              className={`p-4 rounded-[8px] border transition-colors ${
                uploadedFile
                  ? 'bg-[#F5F6F4] border-[#1F7A4D]/40'
                  : 'bg-white border-[#DDE2E0] hover:border-[#16232B]/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Document info */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                      uploadedFile
                        ? 'bg-[#1F7A4D] text-white'
                        : 'bg-[#F5F6F4] text-[#5B6B73]'
                    }`}
                  >
                    <i
                      className={`fa-solid ${
                        uploadedFile ? 'fa-file-circle-check' : 'fa-file-arrow-up'
                      }`}
                    ></i>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[#16232B] text-sm">{doc.label}</h4>
                      {doc.required ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#B3261E]/10 text-[#B3261E] border border-[#B3261E]/20">
                          Required
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#F5F6F4] text-[#5B6B73] border border-[#DDE2E0]">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5B6B73] mt-0.5">{doc.help}</p>

                    {/* Uploaded File Pill */}
                    {uploadedFile && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-[#1F7A4D] bg-white border border-[#DDE2E0] px-2 py-1 rounded-[4px] w-fit tabular-nums">
                        <i className="fa-solid fa-circle-check text-[#1F7A4D]"></i>
                        <span className="font-medium truncate max-w-[220px]">
                          {uploadedFile.name}
                        </span>
                        <span className="text-[10px] text-[#5B6B73]">
                          ({(uploadedFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                    )}

                    {/* Error Message */}
                    {hasError && (
                      <p className="text-xs text-[#B3261E] mt-1.5 flex items-center gap-1 font-medium">
                        <i className="fa-solid fa-circle-exclamation text-xs"></i>
                        <span>{hasError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Hidden File Input */}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[doc.id] = el;
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(doc.id, e)}
                    className="hidden"
                  />

                  {uploadedFile ? (
                    <button
                      type="button"
                      onClick={() => handleRemove(doc.id)}
                      className="min-h-[44px] text-xs font-medium px-3 py-1.5 rounded-[8px] border border-[#B3261E]/30 bg-[#B3261E]/10 text-[#B3261E] hover:bg-[#B3261E]/20 active:translate-y-[1px] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                      <span>Remove</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[doc.id]?.click()}
                      className="min-h-[44px] text-xs font-medium px-3.5 py-1.5 rounded-[8px] border border-[#DDE2E0] bg-white hover:bg-[#F5F6F4] text-[#16232B] active:translate-y-[1px] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-arrow-up-from-bracket text-xs text-[#0B4F6C]"></i>
                      <span>Upload</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="pt-4 border-t border-[#DDE2E0] flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/extensions')}
          className="min-h-[44px] text-xs sm:text-sm font-medium px-4 py-2 rounded-[8px] border border-[#DDE2E0] hover:bg-[#F5F6F4] text-[#16232B] active:translate-y-[1px] transition-colors flex items-center gap-1.5 cursor-pointer order-2 sm:order-1"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          <span>Change loan type</span>
        </button>

        <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto justify-end">
          {!allRequiredUploaded && (
            <span className="text-xs text-[#5B6B73] hidden sm:inline">
              Upload all required documents to proceed
            </span>
          )}

          <button
            type="button"
            disabled={!allRequiredUploaded}
            onClick={() => navigate(`/extensions/loan/${normalizedType}/banks`)}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#0B4F6C] hover:bg-[#093e55] active:translate-y-[1px] text-white font-medium text-xs sm:text-sm rounded-[8px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to bank selection
          </button>
        </div>
      </div>
    </div>
  );
}
