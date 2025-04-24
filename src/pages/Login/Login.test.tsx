import { fireEvent, screen, waitFor } from '@testing-library/react';
import Login from './Login';
import { loginUser } from '../../context/AuthService';
import { renderWithRouter } from '../../utils/test-utils';

// Mock AuthService
jest.mock('../../context/AuthService', () => ({
    loginUser: jest.fn(),
}));

// Mock Form components to expose the error state
jest.mock('../../components/forms/AuthForm/AuthForm', () => {
    return function MockAuthForm({ title, onSubmit, error, children }: any) {
        return (
            <div className="auth-form">
                <h1 className="auth-title">{title}</h1>
                {error && <div data-testid="error-message">{error}</div>}
                <form role="form" onSubmit={onSubmit}>
                    {children}
                </form>
            </div>
        );
    };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
    let consoleErrorMock: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockNavigate.mockClear();
    });

    afterEach(() => {
        consoleErrorMock.mockRestore();
        jest.clearAllMocks();
    });

    test('renders form fields', () => {
        renderWithRouter(<Login />);

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('shows an error when fields are empty', async () => {
        renderWithRouter(<Login />);

        // Need to prevent the default form submission to allow the error check to work
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        // Use waitFor instead of findByText to allow time for state updates
        await waitFor(() => {
            expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
        });
    });

    test('calls loginUser api on form submit', async () => {
        const mockResponse = {
            data: {
                data: {
                    token: 'test-token',
                    user: { id: 1, email: 'test@example.com' },
                },
            },
        };

        (loginUser as jest.Mock).mockResolvedValue(mockResponse);

        renderWithRouter(<Login />);
        const email = 'test@example.com';
        const password = '1234567890';

        // Mock the input fields
        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);

        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.change(passwordInput, { target: { value: password } });

        // Submit the form directly
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(loginUser).toHaveBeenCalledWith({
                email: email,
                password: password,
            });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('shows error message on failed login', async () => {
        (loginUser as jest.Mock).mockRejectedValue(new Error('mocked error'));

        renderWithRouter(<Login />);

        const email = 'test@example.com';
        const password = '1234567890';

        // Mock the input fields
        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);

        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.change(passwordInput, { target: { value: password } });

        // Submit the form directly
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent(/login failed/i);
        });
    });
});
