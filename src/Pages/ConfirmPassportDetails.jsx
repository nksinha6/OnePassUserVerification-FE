import React from "react";
import { ArrowLeft, ShieldCheck, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";

const ConfirmPassportDetails = () => {
  const navigate = useNavigate();

  // ✅ Dummy extracted data
  const passportData = {
    type: "P",
    countryCode: "GBR",
    surname: "STERLING",
    givenNames: "ALEXANDER JAMES",
    passportNumber: "P98234105",
    nationality: "BRITISH",
    gender: "M",
    dob: "12-05-1988",
    placeOfBirth: "LONDON",
    placeOfIssue: "HMPO",
    issueDate: "24-11-2021",
    expiryDate: "24-11-2031",
    address: "12-15 Kensington High Street, London, W8 5NP, United Kingdom",
  };

  return (
    <div className="h-dvh bg-[#f5f5f5] flex flex-col px-4 py-5">
      <MobileHeader />

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-0 py-1">
        {/* TITLE */}
        <h2 className="text-md font-bold text-[#172b29]">
          Verify extracted information
        </h2>

        <p className="mt-2 text-sm text-[#5f6368]">
          We've extracted the following details from your passport. Please
          verify them before proceeding.
        </p>

        {/* CARD */}
        <div className="mt-3 rounded-[10px] overflow-hidden bg-white shadow-sm">
          {/* OCR HEADER */}
          <div className="bg-[#e8eceb] px-4 py-5 flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#50675f]" />

            <p className="text-[#50675f] text-xs font-bold tracking-[2px]">
              OCR CONFIDENCE: HIGH
            </p>
          </div>

          {/* FORM */}
          <div className="p-5">
            {/* IMAGE SECTION */}
            <div className="grid grid-cols-2 gap-4">
              {/* PHOTO */}
              <div>
                <p className="text-[10px] tracking-[2px] text-[#444] mb-1">
                  PHOTOGRAPH
                </p>

                <div className="h-[120px] rounded-[6px] bg-[#dfe5e5] overflow-hidden">
                  <img
                    src="https://placehold.co/300x400"
                    alt="Passport Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* SIGNATURE */}
              <div>
                <p className="text-[10px] tracking-[2px] text-[#444] mb-1">
                  SIGNATURE
                </p>

                <div className="h-[120px] rounded-[6px] bg-[#dfe5e5] flex items-center justify-center">
                  <div className="w-[40px] h-[80px] bg-[#cfd6d6]" />
                </div>
              </div>
            </div>

            {/* TYPE + COUNTRY */}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Field label="TYPE" value={passportData.type} />

              <Field label="COUNTRY CODE" value={passportData.countryCode} />
            </div>

            {/* SURNAME */}
            <div className="mt-3">
              <Field full label="SURNAME" value={passportData.surname} />
            </div>

            {/* GIVEN NAMES */}
            <div className="mt-3">
              <Field
                full
                label="GIVEN NAME(S)"
                value={passportData.givenNames}
              />
            </div>

            {/* PASSPORT NUMBER */}
            <div className="mt-3">
              <Field
                full
                label="PASSPORT NUMBER"
                value={passportData.passportNumber}
              />
            </div>

            {/* NATIONALITY + GENDER */}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Field label="NATIONALITY" value={passportData.nationality} />

              <Field label="SEX / GENDER" value={passportData.gender} />
            </div>

            {/* DOB */}
            <div className="mt-3">
              <Field full label="DATE OF BIRTH" value={passportData.dob} />
            </div>

            {/* PLACE OF BIRTH */}
            <div className="mt-3">
              <Field
                full
                label="PLACE OF BIRTH"
                value={passportData.placeOfBirth}
              />
            </div>

            {/* PLACE OF ISSUE */}
            <div className="mt-3">
              <Field
                full
                label="PLACE OF ISSUE"
                value={passportData.placeOfIssue}
              />
            </div>

            {/* ISSUE + EXPIRY */}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Field label="DATE OF ISSUE" value={passportData.issueDate} />

              <Field label="DATE OF EXPIRY" value={passportData.expiryDate} />
            </div>

            {/* ADDRESS */}
            <div className="mt-3">
              <Field
                full
                multiline
                label="ADDRESS DETAILS"
                value={passportData.address}
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-5 space-y-4">
          {/* CONFIRM */}
          <button
            className="
            w-full h-14 rounded-[6px]
            bg-[#1B3631]
            text-white text-[18px] font-semibold
          "
          >
            Confirm and Continue
          </button>

          {/* RESCAN */}
          <button
            className="
            w-full h-14 rounded-[6px]
            bg-[#e8eceb]
            text-[#2e3c39]
            text-[18px] font-medium
            flex items-center justify-center gap-3
          "
          >
            <ScanLine size={18} />
            Re-scan Document
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ FIELD COMPONENT
const Field = ({ label, value, full, multiline }) => {
  return (
    <div className={full ? "w-full" : ""}>
      <p className="text-[10px] tracking-[2px] text-[#444] mb-2">{label}</p>

      <div
        className={`
          bg-[#dfe5e5]
          rounded-[6px]
          px-4
          ${multiline ? "py-4 min-h-[78px]" : "h-10 flex items-center"}
        `}
      >
        <p className="text-[12px] text-[#172b29] ">{value}</p>
      </div>
    </div>
  );
};

export default ConfirmPassportDetails;
