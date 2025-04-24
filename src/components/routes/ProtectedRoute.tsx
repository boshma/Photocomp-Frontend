import { JSX, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const authContext = useContext(AuthContext);

    if (!authContext?.token) {
        // Redirect to login if there is no token
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
