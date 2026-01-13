const SuccessModal = ({ open }) => {
  if (!open) return null;

  const handleClose = () => {
    window.close();
    setTimeout(() => {
      window.location.replace("about:blank");
    }, 200);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Close Button */}
        <button style={closeButton} onClick={handleClose}>
          ×
        </button>

        {/* Success Animation */}
        <div style={iconWrapper}>
          <svg width="90" height="90" viewBox="0 0 52 52">
            {/* Green filled circle */}
            <circle
              cx="26"
              cy="26"
              r="25"
              fill="#28a745"
              style={circleFillStyle}
            />

            {/* White checkmark */}
            <path
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27 L23 36 L38 18"
              style={checkStyle}
            />
          </svg>
        </div>

        <h2 style={title}>Success</h2>
        <p style={subtitle}>Your process has been completed successfully.</p>
      </div>
    </div>
  );
};

export default SuccessModal;

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  position: "relative",
  background: "#fff",
  padding: "36px 32px",
  borderRadius: "16px",
  width: "420px",
  textAlign: "center",
};

const closeButton = {
  position: "absolute",
  top: "14px",
  right: "16px",
  background: "transparent",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
};

const iconWrapper = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "20px",
};

const title = {
  margin: "0 0 8px",
  fontSize: "20px",
  fontWeight: "600",
};

const subtitle = {
  margin: 0,
  fontSize: "14px",
  color: "#444",
};

const circleFillStyle = {
  transform: "scale(0)",
  transformOrigin: "center",
  animation: "circle-pop 0.4s ease-out forwards",
};

const checkStyle = {
  strokeDasharray: 48,
  strokeDashoffset: 48,
  animation: "check-draw 0.4s ease-out forwards",
  animationDelay: "0.4s",
};
