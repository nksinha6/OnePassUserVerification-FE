import { useNavigate } from "react-router-dom";
import { useCamera } from "@/contexts/CameraContext";
import { ROUTES, UI_TEXT } from "@/constants/ui";
import LoginHeader from "@/components/LoginHeader";
import LogoImage from "@/assets/images/1pass_logo.jpg";

const FaceMatchIntro = () => {
  const navigate = useNavigate();
  const { startCamera } = useCamera();

  const handleTakeSelfie = async () => {
    try {
      await startCamera(); // 🔑 iOS permission
      navigate(ROUTES.SELFIE);
    } catch {
      alert(UI_TEXT.FACE_MATCH_INTRO.CAMERA_PERMISSION_ERROR);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="min-h-screen bg-white border border-gray-200 flex flex-col">
        <div className="m-3 border border-gray-200 rounded-2xl overflow-hidden flex flex-col flex-1">
          {/* HEADER */}
          <LoginHeader logo={LogoImage} />

          {/* BODY */}
          <div className="flex-1 bg-white px-6 py-8 flex flex-col justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-3">
                {UI_TEXT.FACE_MATCH_INTRO.TITLE}
              </h1>

              <p className="text-gray-600 text-sm">
                {UI_TEXT.FACE_MATCH_INTRO.DESCRIPTION}
              </p>

              <p className="mt-6 font-medium">
                {UI_TEXT.FACE_MATCH_INTRO.ENSURE_TITLE}
              </p>

              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {UI_TEXT.FACE_MATCH_INTRO.CONDITIONS.map((item, index) => (
                  <li key={index}>✓ {item}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleTakeSelfie}
              className="h-12 w-full rounded-xl bg-[#0F3D2E] text-white font-medium"
            >
              {UI_TEXT.FACE_MATCH_INTRO.CTA_TAKE_SELFIE}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceMatchIntro;
