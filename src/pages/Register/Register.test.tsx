import { fireEvent, screen, waitFor } from '@testing-library/react';
import Register from './Register';
import { registerUser } from '../../context/AuthService';
import { renderWithRouter } from '../../utils/test-utils';

jest.mock('../../context/AuthService', () => ({
    registerUser: jest.fn(),
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

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
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
        renderWithRouter(<Register />);

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    test('shows an error when fields are empty', async () => {
        renderWithRouter(<Register />);

        // Submit the form directly
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent(
                /please fill in all fields/i
            );
        });
    });

    test('calls registerUser api on form submit', async () => {
        const mockResponse = {
            data: {
                data: {
                    token: 'test-token',
                    user: { id: 1, email: 'test@example.com' },
                },
            },
        };

        (registerUser as jest.Mock).mockResolvedValue(mockResponse);

        renderWithRouter(<Register />);
        const email = 'test@example.com';
        const password = '1234567890';
        const firstName = 'John';
        const lastName = 'Doe';

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: email } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: password } });
        fireEvent.change(screen.getByPlaceholderText(/first name/i), {
            target: { value: firstName },
        });
        fireEvent.change(screen.getByPlaceholderText(/last name/i), {
            target: { value: lastName },
        });

        // Submit the form directly
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(registerUser).toHaveBeenCalledWith({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
            });
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('shows error message on failed registration', async () => {
        (registerUser as jest.Mock).mockRejectedValue(new Error('mocked error'));

        renderWithRouter(<Register />);

        const email = 'test@example.com';
        const password = '1234567890';
        const firstName = 'John';
        const lastName = 'Doe';

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: email } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: password } });
        fireEvent.change(screen.getByPlaceholderText(/first name/i), {
            target: { value: firstName },
        });
        fireEvent.change(screen.getByPlaceholderText(/last name/i), {
            target: { value: lastName },
        });

        // Submit the form directly
        const form = screen.getByRole('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent(/registration failed/i);
        });
    });
});
