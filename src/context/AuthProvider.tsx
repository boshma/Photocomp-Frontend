import { useState, useEffect, ReactNode } from 'react';
import AuthContext, { User } from './AuthContext';

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');
            if (storedUser && storedToken) {
                try {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                } catch (error) {
                    console.error('Error parsing stored user data:', error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }

            setIsInitialized(true);
        };

        initializeAuth();
    }, []);

    const updateUser = (newUser: User | null) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
    };

    const updateToken = (newToken: string | null) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    if (!isInitialized) {
        // TODO: Add some loading state (?)
        return null;
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                setUser: updateUser,
                setToken: updateToken,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
