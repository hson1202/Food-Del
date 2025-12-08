import { useAuth } from '../../Context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children, setShowLogin }) => {
    const { isAuthenticated, isAuthLoading } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (isAuthLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '50vh' 
            }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // If not authenticated, trigger login popup and redirect
    if (!isAuthenticated) {
        // Store the attempted location for redirect after login
        if (setShowLogin) {
            setShowLogin(true);
        }
        // Redirect to home, login popup will be shown
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // User is authenticated, render children
    return children;
};

export default RequireAuth;




