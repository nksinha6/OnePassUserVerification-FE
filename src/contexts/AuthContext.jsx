import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getSession, setSession, clearSession } from "@/services/authService";

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const session = getSession();
    setIsAuthenticated(!!session);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((phoneNumber) => {
    const result = setSession(phoneNumber);

    if (result.success) {
      setIsAuthenticated(true);
    }

    return result;
  }, []);

  const logout = useCallback(() => {
    const result = clearSession();

    if (result.success) {
      setIsAuthenticated(false);
    }

    return result;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    console.error("useAuth must be used within AuthProvider");
    return {
      isAuthenticated: false,
      isLoading: false,
    };
  }

  return context;
};
