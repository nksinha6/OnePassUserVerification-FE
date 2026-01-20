import { IoClose } from "react-icons/io5";
import { ROUTES } from "../constants/ui";
import { useNavigate } from "react-router-dom";

const SuccessModal = ({ open }) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleClose = () => {
    navigate(ROUTES.USER_DETAILS, { replace: true });
  };

  const closeButton = {
    position: "absolute",
    top: "14px",
    right: "16px",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#f1f3f5",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#495057",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Close Button */}
        <button
          style={closeButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e9ecef";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f1f3f5";
            e.currentTarget.style.transform = "scale(1)";
          }}
          onClick={handleClose}
        >
          <IoClose size={18} />
        </button>

        {/* Success Animation */}
        <div style={iconWrapper}>
          <svg width="90" height="90" viewBox="0 0 52 52">
            <circle
              cx="26"
              cy="26"
              r="25"
              fill="#28a745"
              style={circleFillStyle}
            />
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
        <p style={subtitle}>
          Your verification has been completed successfully.
        </p>
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
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#444",
  fontWeight: "500",
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
