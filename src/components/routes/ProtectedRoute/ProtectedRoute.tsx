import { JSX, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../../context/AuthContext';

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const authContext = useContext(AuthContext);

    if (!authContext || !authContext.token) {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            return <Navigate to="/login" replace />;
        }
        console.log('Token found in localStorage but not in context');
    }
    return children;
};

export default ProtectedRoute;
