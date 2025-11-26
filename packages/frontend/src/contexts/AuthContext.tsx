import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { User } from "../types";
import { apiClient } from "../services/api/client";
import { ENDPOINTS } from "../services/api/config";

// Auth types
interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;

  // Permissions
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("auth_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Optionally: set default Authorization header for axios
          // apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          await verifyToken();
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Verify token validity
  const verifyToken = async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.AUTH.PROFILE);
      if (response.data && response.data.success) {
        // Profile endpoint returns success, use localStorage data
        // User data is already set from localStorage
        return;
      } else {
        throw new Error(response.data?.message || "Token verification failed");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      // Don't clear auth on profile check failure during init
      // Only clear on actual login/refresh failures
    }
  };

  // Clear auth state
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
  // Optionally: delete Authorization header
  // delete apiClient.defaults.headers.common['Authorization'];
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("refresh_token");
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);

      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error(response.data?.message || "Login failed");
      }
  const { user: authUser, token: authToken, refreshToken } = response.data.data;
      setUser(authUser);
      setToken(authToken);
      // Optionally: set default Authorization header for axios
      // apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("auth_user", JSON.stringify(authUser));
      localStorage.setItem("refresh_token", refreshToken);
      const displayName =
        (authUser &&
          (authUser.username || authUser.tai_khoan || authUser.email || authUser.ho_ten)) ||
        'unknown-user';
      console.log('Login successful:', displayName);
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      clearAuth();
      window.location.href = "/login";
    }
  }, [clearAuth]);

  // Refresh token function
  const refreshAuthToken = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem("refresh_token");
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }
      const response = await apiClient.post(ENDPOINTS.AUTH.REFRESH, { refreshToken: storedRefreshToken });
      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error(response.data?.message || "Token refresh failed");
      }
      const { user: authUser, token: newToken, refreshToken: newRefreshToken } = response.data.data;
      setUser(authUser);
      setToken(newToken);
      // Optionally: set default Authorization header for axios
      // apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(authUser));
      localStorage.setItem("refresh_token", newRefreshToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearAuth();
      throw error;
    }
  }, [clearAuth]);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const response = await apiClient.put(ENDPOINTS.AUTH.PROFILE, updates);
      if (response.data && response.data.success && response.data.data) {
        setUser(response.data.data);
        localStorage.setItem("auth_user", JSON.stringify(response.data.data));
      } else {
        throw new Error(response.data?.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  }, []);

  // Permission checks
  // Remove hasPermission (User type does not have permissions)
  const hasPermission = useCallback(
    (_permission: string): boolean => false,
    []
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );

  // Auto token refresh
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        await refreshAuthToken();
      } catch (error) {
        console.error("Auto token refresh failed:", error);
        logout();
      }
    }, 15 * 60 * 1000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, [token, refreshAuthToken, logout]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    refreshToken: refreshAuthToken,
    updateProfile,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
