export const HOME_UI = {
  APP_NAME: "1Pass",
  VERIFICATION_LABEL: "GUEST VERIFICATION",

  getTitle: (propertyName) => ({
    line1: "Checking in at",
    propertyName,
  }),

  getDescription: (propertyName, phoneNumber) =>
    `The receptionist has initiated your check-in at ${propertyName} for the number ${phoneNumber}. Please confirm to continue.`,

  CONTINUE_BUTTON: "Confirm",

  PRIVACY_TEXT: "By continuing, you agree to our",
  PRIVACY_LINK: "Privacy Policy",
};

export const EMAIL_CAPTURE_UI = {
  TITLE: "Enter your email",

  DESCRIPTION:
    "We need your email to send your digital access pass and check-in confirmation.",

  EMAIL_LABEL: "EMAIL ADDRESS",

  EMAIL_PLACEHOLDER: "name@company.com",

  PRIVACY_TEXT:
    "Your email address is processed securely for visitor management purposes and will not be used for marketing without your explicit consent.",

  CONTINUE_BUTTON: "Verify email →",
};

export const WELCOME_BACK_UI = {
  TITLE: "Welcome back",

  DESCRIPTION:
    "You have been previously verified. The receptionist has initiated your check-in. Verification will be completed using your registered phone number on file.",

  GUEST_LABEL: "Verified Guest",

  GUEST_STATUS: "Status: Recognition active",

  CONTINUE_BUTTON: "Continue",

  FOOTER_TEXT: "Not you? Contact Support",
};

export const CONSENT_UI = {
  TITLE: "Your consent",

  DESCRIPTION:
    "To provide a secure entry experience, we need your permission to process specific data points in accordance with India's DPDP Act.",

  ITEMS: [
    {
      id: 1,
      title: "Visitor Verification",
      description:
        "Securely verify your identity for facility access and safety protocols.",
      icon: "shield",
    },
    {
      id: 2,
      title: "Data Processing",
      description:
        "Processing of contact details (email/phone) for entry logs and emergency notifications.",
      icon: "database",
    },
    {
      id: 3,
      title: "Retention",
      description:
        "Data is stored only for the duration required by security protocols and deleted thereafter.",
      icon: "clock",
    },
    {
      id: 4,
      title: "Legal Rights",
      description:
        "Exercising your rights under India's Digital Personal Data Protection (DPDP) Act.",
      icon: "scale",
    },
  ],

  CHECKBOX_TEXT:
    "I consent to the processing of my personal data for verification and access management purposes.",

  CHECKBOX_SUBTEXT:
    "By checking this box, you agree to our terms and conditions.",

  PRIVACY_LINK: "View privacy notice",

  CONTINUE_BUTTON: "Proceed Securely",
};

export const VERIFICATION_UI = {
  TITLE: "Your verification code",

  DESCRIPTION:
    "Please read this code aloud to the receptionist to complete your verification.",

  CODE: "482 915",

  FOOTER_TEXT:
    "This ensures a secure check-in experience and protects your identity across all 1Pass partner locations.",

  DONE_BUTTON: "Done",
};
export const CHECKIN_SUCCESS_UI = {
  TITLE: "You're checked in",

  DESCRIPTION:
    "Your verification is complete. The receptionist will now proceed with access or badge issuance.",

  SUBTEXT: "NO FURTHER ACTION IS REQUIRED FROM YOU.",

  DONE_BUTTON: "Done",

  HELP_TEXT: "Need assistance?",
};

export const HISTORY_UI = {
  TITLE: "Your check-in history",

  DESCRIPTION:
    "A record of your previous visits across all 1Pass partner locations.",

  DONE_BUTTON: "Done",

  FOOTER_TEXT: "1Pass",

  ITEMS: [
    {
      id: 1,
      location: "Google HQ",
      date: "12 Oct 2023, 09:30 AM",
      status: "COMPLETED",
    },
    {
      id: 2,
      location: "Microsoft Office",
      date: "10 Oct 2023, 11:15 AM",
      status: "COMPLETED",
    },
    {
      id: 3,
      location: "Reliance Corporate Park",
      date: "05 Oct 2023, 02:00 PM",
      status: "COMPLETED",
    },
    {
      id: 4,
      location: "Apple Park",
      date: "28 Sep 2023, 10:00 AM",
      status: "COMPLETED",
    },
    {
      id: 5,
      location: "Amazon Spheres",
      date: "15 Sep 2023, 01:45 PM",
      status: "COMPLETED",
    },
  ],
};

export const EMAIL_VERIFICATION_UI = {
  STEP_LABEL: "Step 2 of 4",
  TITLE: "Check your inbox",
  DESCRIPTION:
    "We've sent a verification link to {email}. Please click the link to confirm your email address and continue with your check-in.",
  PRIMARY_BUTTON: "Open email app",
  CHANGE_EMAIL: "Change email address",
  RESEND_TEXT: "Didn't receive an email?",
  RESEND_BUTTON: "Resend",
};

export const ROUTES = {
  HOME: "/",
  HOME_WITH_PARAMS: "/home/:guestNumber/:restaurantId",
  EMAIL: "email",
  WELCOME_BACK: "welcome-back",
  CONSENT: "consent",
  VERIFICATION: "verification",
  VERIFICATION_CODE: "verification-code",
  FACE_MATCH: "face-match",
  VERIFICATION_DONE: "verification-done",
  SUCCESS: "success",
  HISTORY: "history",
  EMAIL_VERIFICATION: "email-verification",
  PROFILE: "profile",
  ID_VERIFICATION: "id-verification",
};
