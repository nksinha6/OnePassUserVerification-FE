import React from "react";
import { Routes, Route } from "react-router-dom";
import MobileLayout from "./pages/MobileLayout.jsx";
import Home from "./Pages/Home.jsx";
import EmailCapture from "./Pages/EmailCapture.jsx";
import Consent from "./Pages/Consent.jsx";
import VerificationCode from "./Pages/VerificationCode.jsx";
import FaceMatch from "./Pages/FaceMatch.jsx";
import VerificationDone from "./Pages/VerificationDone.jsx";
import VerificationCodePage from "./Pages/VerificationCodePage.jsx";
import CheckinSuccess from "./Pages/CheckinSuccess.jsx";
import CheckinHistory from "./Pages/CheckinHistory.jsx";
import WelcomeBack from "./Pages/WelcomeBack.jsx";
import EmailVerification from "./Pages/EmailVerification.jsx";
import MyProfile from "./Pages/MyProfile.jsx";
import IdVerification from "./Pages/IdVerification.jsx";
import ParamGuard from "./Components/ParamGuard";
import { ROUTES } from "./constants/ui.js";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        {/* Public routes */}
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.HOME_WITH_PARAMS} element={<Home />} />

        {/* Protected routes */}
        <Route element={<ParamGuard />}>
          <Route path={ROUTES.EMAIL} element={<EmailCapture />} />
          <Route path={ROUTES.WELCOME_BACK} element={<WelcomeBack />} />
          <Route path={ROUTES.CONSENT} element={<Consent />} />
          <Route path={ROUTES.VERIFICATION} element={<VerificationCode />} />
          <Route
            path={ROUTES.VERIFICATION_CODE}
            element={<VerificationCodePage />}
          />
          <Route path={ROUTES.FACE_MATCH} element={<FaceMatch />} />
          <Route
            path={ROUTES.VERIFICATION_DONE}
            element={<VerificationDone />}
          />
          <Route path={ROUTES.SUCCESS} element={<CheckinSuccess />} />
          <Route path={ROUTES.HISTORY} element={<CheckinHistory />} />
          <Route
            path={ROUTES.EMAIL_VERIFICATION}
            element={<EmailVerification />}
          />
          <Route path={ROUTES.PROFILE} element={<MyProfile />} />
          <Route path={ROUTES.ID_VERIFICATION} element={<IdVerification />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
