import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import Home from './Home';
import { renderWithRouter } from '../../utils/test-utils';
import { getPublicOrganizations } from '../../context/OrgService';

jest.mock('../../context/OrgService', () => ({
    getPublicOrganizations: jest.fn(),
    getPublicOrganizationEvents: jest.fn(),
}));

jest.mock('../../components/navButton/NavButton', () => ({
    __esModule: true,
    default: ({ children, to, className, variant }: any) => (
        <button
            data-testid="mock-nav-button"
            data-to={to}
            className={className}
            data-variant={variant}
        >
            {children}
        </button>
    ),
}));

jest.mock('../../components/bars/TopBar/TopBar', () => ({
    __esModule: true,
    default: ({ searchComponent, rightComponents }: any) => (
        <div data-testid="mock-top-bar">
            <div data-testid="search-component-container">{searchComponent}</div>
            <div data-testid="right-components-container">{rightComponents}</div>
        </div>
    ),
}));

jest.mock('../../components/bars/SideBar/SideBar', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-sidebar">Sidebar Content</div>,
}));

jest.mock('../../components/organizationRow/OrganizationRow', () => ({
    __esModule: true,
    default: ({ organization }: any) => (
        <div data-testid="mock-organization-row" data-organization-id={organization.id}>
            {organization.name}
        </div>
    ),
}));

describe('Home Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (getPublicOrganizations as jest.Mock).mockResolvedValue({
            data: {
                organizations: [
                    {
                        id: '1',
                        name: 'Test Organization 1',
                        description: 'Test Description 1',
                        logoUrl: 'https://example.com/logo1.jpg',
                        PK: 'ORG#TEST1',
                    },
                    {
                        id: '2',
                        name: 'Test Organization 2',
                        description: 'Test Description 2',
                        logoUrl: 'https://example.com/logo2.jpg',
                        PK: 'ORG#TEST2',
                    },
                    {
                        id: '3',
                        name: 'Test Organization 3',
                        description: 'Test Description 3',
                        logoUrl: 'https://example.com/logo3.jpg',
                        PK: 'ORG#TEST3',
                    },
                ],
            },
            lastEvaluatedKey: null,
        });
    });

    test('renders the page structure correctly', async () => {
        await act(async () => {
            renderWithRouter(<Home />);
        });

        expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('mock-top-bar')).toBeInTheDocument();
        expect(screen.getByText('Organizations & Event')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Loading organizations...')).not.toBeInTheDocument();
            expect(screen.getAllByTestId('mock-organization-row')).toHaveLength(3);
        });
    });

    test('calls getPublicOrganizations on initial render', async () => {
        await act(async () => {
            renderWithRouter(<Home />);
        });

        expect(getPublicOrganizations).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(screen.getAllByTestId('mock-organization-row')).toHaveLength(3);
        });
    });

    test('displays login and register buttons when not authenticated', async () => {
        await act(async () => {
            renderWithRouter(<Home />);
        });

        const rightComponentsContainer = screen.getByTestId('right-components-container');
        const registerButton = screen.getByText('Register');
        const loginButton = screen.getByText('Login');

        expect(rightComponentsContainer).toContainElement(registerButton);
        expect(rightComponentsContainer).toContainElement(loginButton);

        expect(registerButton.closest('[data-to]')).toHaveAttribute('data-to', '/register');
        expect(loginButton.closest('[data-to]')).toHaveAttribute('data-to', '/login');
    });

    test('does not display login and register buttons when authenticated', async () => {
        const authContext = {
            user: {
                id: '1',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'user',
            },
            token: 'valid-token',
            setUser: jest.fn(),
            setToken: jest.fn(),
            logout: jest.fn(),
        };

        await act(async () => {
            renderWithRouter(<Home />, { authContext });
        });

        expect(screen.queryByText('Register')).not.toBeInTheDocument();
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    test('shows search bar that responds to input', async () => {
        await act(async () => {
            renderWithRouter(<Home />);
        });

        const searchInput = screen.getByPlaceholderText('Search organizations...');
        expect(searchInput).toBeInTheDocument();
        await act(async () => {
            fireEvent.change(searchInput, { target: { value: 'Test Search' } });
        });

        expect(searchInput).toHaveValue('Test Search');
    });

    test('handles search submission', async () => {
        await act(async () => {
            renderWithRouter(<Home />);
        });

        const originalConsoleLog = console.log;
        const mockConsoleLog = jest.fn();
        console.log = mockConsoleLog;

        const searchInput = screen.getByPlaceholderText('Search organizations...');
        await act(async () => {
            fireEvent.change(searchInput, { target: { value: 'Test Search' } });
        });

        const form = searchInput.closest('form');
        await act(async () => {
            fireEvent.submit(form!);
        });

        expect(mockConsoleLog).toHaveBeenCalledWith('Search submitted:', 'Test Search');
        console.log = originalConsoleLog;
    });

    test('displays load more button and loads more organizations when clicked', async () => {
        const additionalOrgs = {
            data: {
                organizations: [
                    {
                        id: '4',
                        name: 'Test Organization 4',
                        description: 'Test Description 4',
                        logoUrl: 'https://example.com/logo4.jpg',
                        PK: 'ORG#TEST4',
                    },
                    {
                        id: '5',
                        name: 'Test Organization 5',
                        description: 'Test Description 5',
                        logoUrl: 'https://example.com/logo5.jpg',
                        PK: 'ORG#TEST5',
                    },
                ],
            },
            lastEvaluatedKey: null,
        };

        (getPublicOrganizations as jest.Mock).mockClear();
        (getPublicOrganizations as jest.Mock).mockResolvedValueOnce({
            data: {
                organizations: [
                    {
                        id: '1',
                        name: 'Test Organization 1',
                        description: 'Test Description 1',
                        logoUrl: 'https://example.com/logo1.jpg',
                        PK: 'ORG#TEST1',
                    },
                    {
                        id: '2',
                        name: 'Test Organization 2',
                        description: 'Test Description 2',
                        logoUrl: 'https://example.com/logo2.jpg',
                        PK: 'ORG#TEST2',
                    },
                    {
                        id: '3',
                        name: 'Test Organization 3',
                        description: 'Test Description 3',
                        logoUrl: 'https://example.com/logo3.jpg',
                        PK: 'ORG#TEST3',
                    },
                ],
            },
            lastEvaluatedKey: 'last-key',
        });

        (getPublicOrganizations as jest.Mock).mockResolvedValueOnce(additionalOrgs);
        await act(async () => {
            renderWithRouter(<Home />);
        });

        await waitFor(() => {
            expect(screen.getAllByTestId('mock-organization-row')).toHaveLength(3);
        });

        const loadMoreButton = screen.getByText('Load More');
        expect(loadMoreButton).toBeInTheDocument();
        await act(async () => {
            fireEvent.click(loadMoreButton);
        });

        expect(getPublicOrganizations).toHaveBeenCalledTimes(2);
        expect(getPublicOrganizations).toHaveBeenLastCalledWith('last-key');

        await waitFor(() => {
            expect(screen.getAllByTestId('mock-organization-row')).toHaveLength(5);
        });
    });

    test('handles error when fetching organizations fails', async () => {
        (getPublicOrganizations as jest.Mock).mockClear();
        (getPublicOrganizations as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
        const originalConsoleError = console.error;
        console.error = jest.fn();

        await act(async () => {
            renderWithRouter(<Home />);
        });

        await waitFor(() => {
            expect(
                screen.getByText('Failed to load organizations. Please try again later.')
            ).toBeInTheDocument();
        });

        console.error = originalConsoleError;
    });

    test('renders empty state when no organizations are returned', async () => {
        (getPublicOrganizations as jest.Mock).mockClear();
        (getPublicOrganizations as jest.Mock).mockResolvedValueOnce({
            data: {
                organizations: [],
            },
            lastEvaluatedKey: null,
        });

        await act(async () => {
            renderWithRouter(<Home />);
        });

        await waitFor(() => {
            expect(screen.getByText('No organizations found.')).toBeInTheDocument();
        });
    });
});
