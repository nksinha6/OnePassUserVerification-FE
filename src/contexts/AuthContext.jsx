// src/contexts/AuthContext.jsx - Minimal production version
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

const SESSION_KEY = "authSession";

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = sessionStorage.getItem(SESSION_KEY);

        if (!sessionData) {
          setIsAuthenticated(false);
          return;
        }

        // Basic validation
        const parsedData = JSON.parse(sessionData);

        if (parsedData && parsedData.phone && parsedData.timestamp) {
          // Optional: Check if session is older than 24 hours
          const isExpired =
            Date.now() - parsedData.timestamp > 24 * 60 * 60 * 1000;

          if (!isExpired) {
            setIsAuthenticated(true);
          } else {
            sessionStorage.removeItem(SESSION_KEY);
            setIsAuthenticated(false);
          }
        } else {
          sessionStorage.removeItem(SESSION_KEY);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        sessionStorage.removeItem(SESSION_KEY);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback((phoneNumber) => {
    // Basic validation
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      throw new Error("Please enter a valid phone number");
    }

    try {
      const sessionData = {
        phone: phoneNumber.trim(),
        timestamp: Date.now(),
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Login failed:", error);

      if (error.name === "QuotaExceededError") {
        throw new Error("Browser storage is full. Please clear some data.");
      }

      throw new Error("Failed to login. Please try again.");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
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
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
