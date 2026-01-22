import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import AppLayout from "@/pages/AppLayout";
import MobileSelfiePage from "@/pages/MobileSelfiePage";
import PreviousCheckins from "@/pages/PreviousCheckins";
import ProtectedRoute from "@/components/ProtectedRoute";
import SuccessPage from "@/pages/SuccessPage";
import UserDetails from "@/pages/UserDetails";
import FaceMatchIntro from "@/pages/FaceMatchIntro";
import { ROUTES } from "@/constants/ui";

// Create a wrapper component that uses AppLayout
const LayoutWrapper = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};
// ✅ Compute basename for dev vs prod
const basename = import.meta.env.DEV ? "/" : "/user";

const Router = () => (
  <BrowserRouter basename={basename}>
    <AuthProvider>
      <Routes>
        {/* All routes that use AppLayout */}
        <Route element={<LayoutWrapper />}>
          {/* Login page - accessible to everyone */}
          <Route path={`${ROUTES.LOGIN}/:phone?`} element={<LoginPage />} />

          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.CHECKINS} element={<PreviousCheckins />} />
            <Route path={ROUTES.SELFIE} element={<MobileSelfiePage />} />
            <Route path={ROUTES.SUCCESS} element={<SuccessPage />} />
            <Route path={ROUTES.USER_DETAILS} element={<UserDetails />} />
            <Route
              path={ROUTES.FACE_MATCH_INTRO}
              element={<FaceMatchIntro />}
            />
          </Route>
        </Route>

        {/* Catch-all - redirect to login */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default Router;
