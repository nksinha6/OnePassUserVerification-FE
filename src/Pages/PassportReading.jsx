import React, { useEffect, useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PassportReading = () => {
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);

  // ✅ FAKE LOADING
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          // navigate next screen
          // navigate("/face-match");

          return 100;
        }

        return prev + 5;
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-dvh bg-[#f5f5f5] px-4 py-5 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        {/* BACK */}
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={28} className="text-[#1B3631]" />
        </button>

        {/* PROCESSING BADGE */}
        <div
          className="
          bg-[#e7eaeb]
          rounded-full
          px-4 py-2
          flex items-center gap-2
        "
        >
          <ShieldCheck size={18} className="text-[#536b63]" />

          <span className="text-[13px] tracking-[1px] font-medium text-[#536b63]">
            SECURELY PROCESSING
          </span>
        </div>
      </div>

      {/* SCANNER CARD */}
      <div className="mt-10 rounded-[16px] overflow-hidden bg-white shadow-sm">
        {/* TOP BAR */}
        <div className="bg-[#e8eceb] px-5 py-4">
          <p className="text-[#4d645b] text-[14px] font-bold tracking-[3px]">
            SCANNING IN PROGRESS
          </p>
        </div>

        {/* BODY */}
        <div className="relative h-[280px] bg-[#f7f7f7] overflow-hidden">
          {/* Passport Shape */}
          <div
            className="
            absolute left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            w-[180px] h-[220px]
            border border-[#c8c8c8]
            rounded-[90px]
          "
          />

          {/* Horizontal Scan Line */}
          <div
            className="absolute left-0 w-full h-[2px]
            bg-[#6d8b81]
            animate-pulse"
            style={{
              top: `${progress}%`,
              transition: "top 180ms linear",
            }}
          />

          {/* Vertical Guides */}
          <div className="absolute left-8 top-0 h-full w-[1px] bg-[#d3d3d3]" />
          <div className="absolute right-8 top-0 h-full w-[1px] bg-[#d3d3d3]" />

          {/* Bottom Text */}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[14px] text-[#4f4f4f]">
            Capturing Image...
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="mt-12 text-center px-2">
        <h1 className="text-[26px] leading-[34px] font-bold text-[#172b29]">
          Reading your passport
        </h1>

        <p className="mt-5 text-[16px] leading-[32px] text-[#5f6368]">
          Please wait while we extract information from your document. This
          usually takes a few seconds.
        </p>
      </div>

      {/* STATUS CARD */}
      <div className="mt-12 bg-[#eef1f1] rounded-[16px] p-5">
        {/* LABEL */}
        <p className="text-[13px] tracking-[3px] text-[#666]">STATUS</p>

        {/* STATUS ROW */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-[#48675f] text-[18px] font-semibold">
            Extracting data...
          </p>

          <p className="text-[#4f4f4f] text-[18px]">{progress}%</p>
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-6 h-3 bg-[#d7dfde] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#48675f] rounded-full transition-all duration-200"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* SPACER */}
      <div className="flex-1" />

      {/* CANCEL */}
      <button className="text-[#48675f] text-[18px] font-semibold">
        Cancel request
      </button>

      {/* FOOTER */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <ShieldCheck size={18} className="text-[#b0b0b0]" />

        <p className="text-[12px] tracking-[3px] text-[#b0b0b0] font-semibold">
          AES-256 ENCRYPTED TRANSFER
        </p>
      </div>
    </div>
  );
};

export default PassportReading;
