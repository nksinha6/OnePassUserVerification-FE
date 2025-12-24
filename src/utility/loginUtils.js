import { UI_TEXT, FORM_CONFIG } from "../constants/ui";

// Validate phone and OTP fields
export const validateForm = (values, otpSent = false) => {
  const errors = {};

  // Validate phone
  if (!values.phone) {
    errors.phone = UI_TEXT.PHONE_REQUIRED_ERROR;
  } else if (typeof values.phone === "string") {
    const phoneStr = values.phone.replace(/\D/g, "");
    if (phoneStr.length < 10) {
      errors.phone = UI_TEXT.PHONE_INVALID_ERROR;
    }
  }

  // Validate OTP only if otpSent
  if (otpSent) {
    if (!values.otp) {
      errors.otp = UI_TEXT.OTP_REQUIRED_ERROR;
    } else if (!/^[0-9]{6}$/.test(values.otp)) {
      errors.otp = UI_TEXT.OTP_INVALID_ERROR;
    }
  }

  return errors;
};

// Format OTP array for inputs
export const updateOtpValue = (currentOtp, index, value) => {
  const numbersOnly = value.replace(/\D/g, "");
  const otpArray = currentOtp.split("");
  otpArray[index] = numbersOnly.slice(-1) || "";
  return otpArray.join("");
};

// Simulate sending OTP
export const sendOtpApi = async (phone) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("OTP sent to:", phone);
    return { success: true, message: UI_TEXT.OTP_SENT_ALERT(phone) };
  } catch (error) {
    console.error("OTP send failed:", error);
    return { success: false, message: UI_TEXT.OTP_SEND_FAILED_ERROR };
  }
};

// Simulate verifying OTP
export const verifyOtpApi = async (phone, otp) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Login data:", { phone, otp });
    return { success: true, message: UI_TEXT.LOGIN_SUCCESS_ALERT };
  } catch (error) {
    console.error("OTP verification failed:", error);
    return { success: false, message: UI_TEXT.LOGIN_FAILED_ERROR };
  }
};

// Simulate resending OTP
export const resendOtpApi = async (phone) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("OTP resent to:", phone);
    return { success: true, message: UI_TEXT.OTP_RESENT_ALERT(phone) };
  } catch (error) {
    console.error("OTP resend failed:", error);
    return { success: false, message: UI_TEXT.OTP_RESEND_FAILED_ERROR };
  }
};

// Start a countdown timer
export const startResendTimer = (setResendTimer, duration) => {
  setResendTimer(duration);
  const interval = setInterval(() => {
    setResendTimer((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return interval;
};

// ----------

export const validatePhoneNumber = (phone) => {
  if (!phone) return UI_TEXT.PHONE_INVALID_ERROR;
  if (!/^\+91\d{10}$/.test(phone)) return UI_TEXT.PHONE_INVALID_ERROR;
  return "";
};

export const validateOTP = (otp) => {
  if (!otp || otp.length !== FORM_CONFIG.OTP_LENGTH) {
    return UI_TEXT.OTP_INVALID_ERROR;
  }
  if (!/^\d{6}$/.test(otp)) return UI_TEXT.OTP_INVALID_ERROR;
  return "";
};
