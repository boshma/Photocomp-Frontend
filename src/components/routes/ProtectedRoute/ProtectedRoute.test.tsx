import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AuthContext, { AuthContextType, User } from '../../../context/AuthContext';

// Mock Navigate component
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
}));

const MockChildComponent = () => <div data-testid="protected-child">Protected Content</div>;

describe('ProtectedRoute Component', () => {
    const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
    };

    const renderComponent = (authContextValue: Partial<AuthContextType>) => {
        return render(
            <MemoryRouter initialEntries={['/']}>
                <AuthContext.Provider value={authContextValue as AuthContextType}>
                    <ProtectedRoute>
                        <MockChildComponent />
                    </ProtectedRoute>
                </AuthContext.Provider>
            </MemoryRouter>
        );
    };

    test('renders child component when user is authenticated', () => {
        const authContextValue: Partial<AuthContextType> = {
            user: mockUser,
            token: 'valid-token',
            setUser: jest.fn(),
            setToken: jest.fn(),
            logout: jest.fn(),
        };

        renderComponent(authContextValue);

        expect(screen.getByTestId('protected-child')).toBeInTheDocument();
        expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    test('redirects to login when user is not authenticated', () => {
        const authContextValue: Partial<AuthContextType> = {
            user: null,
            token: null,
            setUser: jest.fn(),
            setToken: jest.fn(),
            logout: jest.fn(),
        };

        renderComponent(authContextValue);

        expect(screen.queryByTestId('protected-child')).not.toBeInTheDocument();
        const navigate = screen.getByTestId('navigate');
        expect(navigate).toBeInTheDocument();
        expect(navigate).toHaveAttribute('data-to', '/login');
    });

    test('redirects to login when token is missing even if user exists', () => {
        const authContextValue: Partial<AuthContextType> = {
            user: mockUser,
            token: null, // Token is missing
            setUser: jest.fn(),
            setToken: jest.fn(),
            logout: jest.fn(),
        };

        renderComponent(authContextValue);

        expect(screen.queryByTestId('protected-child')).not.toBeInTheDocument();
        const navigate = screen.getByTestId('navigate');
        expect(navigate).toBeInTheDocument();
        expect(navigate).toHaveAttribute('data-to', '/login');
    });
});
