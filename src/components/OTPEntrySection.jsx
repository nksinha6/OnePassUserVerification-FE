import { useState, useRef, useEffect, useCallback } from "react";
import { Edit2, RefreshCw } from "lucide-react";
import { UI_TEXT, FORM_CONFIG } from "../constants/ui";
import {
  validateOTP,
  updateOtpValue,
  startResendTimer,
} from "../utility/loginUtils";

const OTPEntrySection = ({
  phoneNumber,
  onEditPhone,
  onVerify,
  onResend,
  isLoading,
  apiError,
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(
    FORM_CONFIG.RESEND_TIMER_SECONDS
  );
  const [isResending, setIsResending] = useState(false);
  const otpRefs = useRef([]);

  // Get country code and formatted number
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return { countryCode: "", number: "" };

    // Extract country code (e.g., +91, +1, +44)
    const match = phone.match(/^(\+\d+)(.*)/);
    if (match) {
      return {
        countryCode: match[1],
        number: match[2],
      };
    }

    return { countryCode: "", number: phone };
  };

  const formattedPhone = formatPhoneForDisplay(phoneNumber);

  // Handle resend timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = startResendTimer(setResendTimer, resendTimer);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  const handleOtpChange = useCallback(
    (index, value) => {
      if (!/^\d?$/.test(value)) return;

      const newOtp = updateOtpValue(otp, index, value);
      setOtp(newOtp);

      if (error) setError("");

      if (value && index < FORM_CONFIG.OTP_LENGTH - 1) {
        otpRefs.current[index + 1]?.focus();
      }

      // Auto-submit when OTP is complete
      if (newOtp.length === FORM_CONFIG.OTP_LENGTH) {
        handleSubmit(newOtp);
      }
    },
    [otp, error]
  );

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendClick = async () => {
    if (resendTimer > 0 || isLoading || isResending) return;

    setIsResending(true);
    try {
      await onResend();
      setResendTimer(FORM_CONFIG.RESEND_TIMER_SECONDS);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (enteredOtp = otp) => {
    const validationError = validateOTP(enteredOtp);
    if (validationError) {
      setError(validationError);
      return;
    }

    onVerify(enteredOtp);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex flex-col flex-1"
      noValidate
    >
      <div className="flex flex-col flex-1 space-y-6">
        {/* Phone Display */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                {UI_TEXT.MOBILE_NUMBER_LABEL}
              </p>
              <p className="text-lg font-medium">
                {formattedPhone.countryCode} {formattedPhone.number}
              </p>
            </div>
            <button
              type="button"
              onClick={onEditPhone}
              disabled={isLoading}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>
        </div>

        {/* Rest of the component remains the same... */}
        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            {UI_TEXT.OTP_LABEL}
          </label>

          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: FORM_CONFIG.OTP_LENGTH }).map((_, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={otp[index] || ""}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                disabled={isLoading}
                autoFocus={index === 0}
                className={`h-12 text-center text-lg border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none ${
                  error
                    ? "border-red-300 ring-1 ring-red-300"
                    : "border-gray-300"
                }`}
              />
            ))}
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {/* Resend OTP */}
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm text-gray-600">Didn't get the code?</p>
            <button
              type="button"
              onClick={handleResendClick}
              disabled={resendTimer > 0 || isLoading || isResending}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : isResending
                ? "Resending..."
                : "Resend it"}
            </button>
          </div>
        </div>

        {/* Submit Button and Terms */}
        <div className="mt-auto space-y-3">
          <button
            type="submit"
            disabled={isLoading || otp.length !== FORM_CONFIG.OTP_LENGTH}
            className="w-full py-3 px-4 bg-brand hover:bg-brand-dark rounded-lg text-white font-medium disabled:opacity-50 transition-colors"
          >
            {isLoading
              ? UI_TEXT.VERIFYING_OTP_BUTTON
              : UI_TEXT.VERIFY_OTP_BUTTON}
          </button>

          <p className="text-center text-xs text-gray-500 px-2">
            By submitting the OTP you agree to our{" "}
            <a
              href="/terms-of-service"
              className="text-blue-600 hover:text-blue-700 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              className="text-blue-600 hover:text-blue-700 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </form>
  );
};

export default OTPEntrySection;
