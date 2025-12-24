// ui.js
export const UI_TEXT = {
  // Page level
  PAGE_TITLE: "Welcome To Onepass",
  PAGE_SUBTITLE: "Sign in with Mobile & OTP",

  // Form labels
  MOBILE_NUMBER_LABEL: "Mobile Number",
  OTP_LABEL: "Enter 6-digit OTP",
  REMEMBER_ME_LABEL: "Remember me",

  // Placeholders
  PHONE_PLACEHOLDER: "Enter phone number",

  // Helper text
  OTP_HELPER_TEXT: "We'll send an OTP to this number",

  // Button texts
  SEND_OTP_BUTTON: "Send OTP",
  VERIFY_OTP_BUTTON: "Verify OTP",
  SENDING_OTP_BUTTON: "Sending OTP...",
  VERIFYING_OTP_BUTTON: "Verifying...",
  RESEND_OTP_BUTTON: "Resend OTP",
  RESEND_OTP_TIMER: (seconds) => `Resend OTP in ${seconds}s`,

  // Alert messages
  OTP_SENT_ALERT: (phone) => `OTP sent to ${phone}`,
  OTP_RESENT_ALERT: (phone) => `OTP resent to ${phone}`,
  LOGIN_SUCCESS_ALERT: "Login successful!",

  // Error messages
  LOGIN_FAILED_ERROR: "Login failed. Please try again.",
  OTP_SEND_FAILED_ERROR: "Failed to send OTP. Please try again.",
  OTP_RESEND_FAILED_ERROR: "Failed to resend OTP. Please try again.",

  // Validation errors
  PHONE_REQUIRED_ERROR: "Phone number is required",
  PHONE_INVALID_ERROR: "Please enter a valid phone number",
  OTP_REQUIRED_ERROR: "OTP is required",
  OTP_INVALID_ERROR: "Please enter a valid 6-digit OTP",
};

export const FORM_CONFIG = {
  OTP_LENGTH: 6,
  RESEND_TIMER_SECONDS: 30,
};
