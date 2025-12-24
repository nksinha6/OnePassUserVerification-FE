import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./pages/AppLayout";
import PreviousCheckins from "./pages/PreviousCheckins";
import ProtectedRoute from "./components/ProtectedRoute";

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
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkins" element={<PreviousCheckins />} />

              {/* Add more protected routes here */}
            </Route>
          </Route>

          {/* Catch-all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
