import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import config from "../config/config";

// Create AuthContext
export const AuthContext = createContext(null);

// Custom hook to use AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// AuthProvider component
const AuthProvider = ({ children }) => {
    const [token, setToken] = useState("");
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    const url = config.BACKEND_URL;

    // Verify token with backend
    const verifyToken = async (tokenToVerify) => {
        try {
            const response = await axios.get(url + "/api/user/verify", {
                headers: { token: tokenToVerify }
            });
            
            if (response.data.success) {
                return {
                    isValid: true,
                    user: response.data.user
                };
            }
            return { isValid: false };
        } catch (error) {
            console.error("Token verification failed:", error);
            return { isValid: false };
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            setAuthError(null);
            const response = await axios.post(url + "/api/user/login", {
                email,
                password
            });

            if (response.data.success) {
                const newToken = response.data.token;
                localStorage.setItem("token", newToken);
                
                // Verify token to get user info
                const verification = await verifyToken(newToken);
                if (verification.isValid) {
                    setToken(newToken);
                    setUser(verification.user);
                    setIsAuthenticated(true);
                    return { success: true };
                } else {
                    localStorage.removeItem("token");
                    return { success: false, message: "Token verification failed" };
                }
            } else {
                return { success: false, message: response.data.message || "Login failed" };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Network error occurred";
            setAuthError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    // Register function
    const register = async (name, email, password) => {
        try {
            setAuthError(null);
            const response = await axios.post(url + "/api/user/register", {
                name,
                email,
                password
            });

            if (response.data.success) {
                const newToken = response.data.token;
                localStorage.setItem("token", newToken);
                
                // Verify token to get user info
                const verification = await verifyToken(newToken);
                if (verification.isValid) {
                    setToken(newToken);
                    setUser(verification.user);
                    setIsAuthenticated(true);
                    return { success: true };
                } else {
                    localStorage.removeItem("token");
                    return { success: false, message: "Token verification failed" };
                }
            } else {
                return { success: false, message: response.data.message || "Registration failed" };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Network error occurred";
            setAuthError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    // Refresh user data from backend
    const refreshUser = async () => {
        if (!token) return;
        
        try {
            const verification = await verifyToken(token);
            if (verification.isValid) {
                setUser(verification.user);
            }
        } catch (error) {
            console.error("Error refreshing user data:", error);
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
    };

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            setIsAuthLoading(true);
            setAuthError(null);

            const localToken = localStorage.getItem("token");
            
            if (!localToken) {
                // No token found
                setIsAuthenticated(false);
                setIsAuthLoading(false);
                return;
            }

            // Verify token with backend
            const verification = await verifyToken(localToken);
            
            if (verification.isValid) {
                // Token is valid
                setToken(localToken);
                setUser(verification.user);
                setIsAuthenticated(true);
            } else {
                // Token is invalid or expired
                console.log("❌ Token is invalid or expired, clearing...");
                localStorage.removeItem("token");
                setToken("");
                setUser(null);
                setIsAuthenticated(false);
            }

            setIsAuthLoading(false);
        };

        initializeAuth();

        // Listen for storage changes (sync between tabs)
        const handleStorageChange = (e) => {
            if (e.key === "token") {
                if (e.newValue) {
                    // Token was added/updated in another tab
                    verifyToken(e.newValue).then(verification => {
                        if (verification.isValid) {
                            setToken(e.newValue);
                            setUser(verification.user);
                            setIsAuthenticated(true);
                        } else {
                            logout();
                        }
                    });
                } else {
                    // Token was removed in another tab
                    logout();
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const contextValue = {
        token,
        user,
        isAuthenticated,
        isAuthLoading,
        authError,
        login,
        register,
        logout,
        refreshUser,
        setAuthError
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

