import React, { useState } from "react";
import { ArrowLeft, ShieldCheck, ScanLine } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";

const ConfirmPassportDetails = () => {
  const location = useLocation();
  const receivedPassportData = location.state?.passportData;
  console.log("Received Passport Data", receivedPassportData);

  const businessType = (
    sessionStorage.getItem("businessType") || "Hospitality"
  ).toLowerCase();
  const businessPlan = (
    sessionStorage.getItem("businessPlan") || "Starter"
  ).toLowerCase();
  const navigate = useNavigate();

  const handleConfirmContinue = () => {
    // ✅ CORPORATE / HOSPITALITY + SMB
    if (
      (businessType === "corporate" || businessType === "hospitality") &&
      businessPlan === "smb"
    ) {
      navigate("/verification-code", {
        state: { receivedPassportData },
      });
      return;
    }

    // ✅ CORPORATE / HOSPITALITY + ENTERPRISE
    if (
      (businessType === "corporate" || businessType === "hospitality") &&
      businessPlan === "enterprise"
    ) {
      navigate("/face-match");
      return;
    }
  };

  // ✅ Dummy extracted data
  const [passportData, setPassportData] = useState({
    type: receivedPassportData?.passport_type,
    countryCode: receivedPassportData?.country_code,
    surname: receivedPassportData?.full_name?.split(" ")[1],
    givenNames: receivedPassportData?.full_name?.split(" ")[0],
    passportNumber: receivedPassportData?.passport_number,
    nationality: receivedPassportData?.nationality,
    gender: receivedPassportData?.gender,
    dob: receivedPassportData?.dob,
    placeOfBirth: receivedPassportData?.birth_place,
    placeOfIssue: receivedPassportData?.place_of_issue,
    issueDate: receivedPassportData?.issue_date,
    expiryDate: receivedPassportData?.expiry_date,
    address: receivedPassportData?.address,
  });

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
              <Field
                label="TYPE"
                field="type"
                value={passportData.type}
                passportData={passportData}
                setPassportData={setPassportData}
              />

              <Field label="COUNTRY CODE" value={passportData.countryCode} />
            </div>

            {/* SURNAME */}
            <div className="mt-3">
              <Field
                full
                label="SURNAME"
                field="surname"
                value={passportData.surname}
                passportData={passportData}
                setPassportData={setPassportData}
              />
            </div>

            {/* GIVEN NAMES */}
            <div className="mt-3">
              <Field
                full
                label="GIVEN NAME(S)"
                field="givenNames"
                value={passportData.givenNames}
                passportData={passportData}
                setPassportData={setPassportData}
              />
            </div>

            {/* PASSPORT NUMBER */}
            <div className="mt-3">
              <Field
                full
                label="PASSPORT NUMBER"
                field="passportNumber"
                value={passportData.passportNumber}
                passportData={passportData}
                setPassportData={setPassportData}
              />
            </div>

            {/* NATIONALITY + GENDER */}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Field
                label="NATIONALITY"
                field="nationality"
                value={passportData.nationality}
                passportData={passportData}
                setPassportData={setPassportData}
              />

              <Field
                label="SEX / GENDER"
                field="gender"
                value={passportData.gender}
                passportData={passportData}
                setPassportData={setPassportData}
              />
            </div>

            {/* DOB */}
            <div className="mt-3">
              <Field
                full
                label="DATE OF BIRTH"
                field="dob"
                value={passportData.dob}
                passportData={passportData}
                setPassportData={setPassportData}
              />
            </div>

            {/* PLACE OF BIRTH */}
            <div className="mt-3">
              <Field
                full
                label="PLACE OF BIRTH"
                field="placeOfBirth"
                value={passportData.placeOfBirth}
                passportData={passportData}
                setPassportData={setPassportData}
              />
            </div>

            {/* PLACE OF ISSUE */}
            <div className="mt-3">
              <Field
                full
                label="PLACE OF ISSUE"
                field="placeOfIssue"
                value={passportData.placeOfIssue}
                passportData={passportData}
                setPassportData={setPassportData}
              />
            </div>

            {/* ISSUE + EXPIRY */}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Field
                label="DATE OF ISSUE"
                field="issueDate"
                value={passportData.issueDate}
                passportData={passportData}
                setPassportData={setPassportData}
              />

              <Field
                label="DATE OF EXPIRY"
                field="expiryDate"
                value={passportData.expiryDate}
                passportData={passportData}
                setPassportData={setPassportData}
              />
            </div>

            {/* ADDRESS */}
            <div className="mt-3">
              <Field
                full
                multiline
                label="ADDRESS DETAILS"
                field="address"
                value={passportData.address}
                passportData={passportData}
                setPassportData={setPassportData}
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-5 space-y-4">
          {/* CONFIRM */}
          <button
            onClick={handleConfirmContinue}
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
            onClick={() => navigate("/Passport-Manual-verification")}
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
const Field = ({
  label,
  value,
  field,
  passportData,
  setPassportData,
  full,
  multiline,
}) => {
  return (
    <div className={full ? "w-full" : ""}>
      {/* LABEL */}
      <p className="text-[10px] tracking-[2px] text-[#444] mb-2">{label}</p>

      {/* INPUT */}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) =>
            setPassportData({
              ...passportData,
              [field]: e.target.value,
            })
          }
          rows={3}
          className="
            w-full
            bg-[#dfe5e5]
            rounded-[6px]
            px-4 py-3
            text-[12px]
            text-[#172b29]
            outline-none
            resize-none
          "
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) =>
            setPassportData({
              ...passportData,
              [field]: e.target.value,
            })
          }
          className="
            w-full h-10
            bg-[#dfe5e5]
            rounded-[6px]
            px-4
            text-[12px]
            text-[#172b29]
            outline-none
          "
        />
      )}
    </div>
  );
};

export default ConfirmPassportDetails;
