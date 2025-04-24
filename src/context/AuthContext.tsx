import { createContext } from 'react';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
}

// Create a default value for the context to avoid null checks
const defaultContext: AuthContextType = {
    user: null,
    token: null,
    setUser: () => {},
    setToken: () => {},
    logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export default AuthContext;
