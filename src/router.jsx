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
import PreviousCheckins from "@/pages/PreviousCheckins";
import ProtectedRoute from "@/components/ProtectedRoute";

import { ROUTES } from "@/constants/ui";

// Create a wrapper component that uses AppLayout
const LayoutWrapper = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

const Router = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* All routes that use AppLayout */}
          <Route element={<LayoutWrapper />}>
            {/* Login page - accessible to everyone */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />

            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.CHECKINS} element={<PreviousCheckins />} />

              {/* Add more protected routes here */}
            </Route>
          </Route>

          {/* Catch-all - redirect to login */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
