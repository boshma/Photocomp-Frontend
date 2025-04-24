import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import Membership from './Membership';
import { renderWithRouter } from '../../utils/test-utils';
import {
    getOrganizationMembershipRequests,
    acceptMembershipRequest,
    denyMembershipRequest,
} from '../../context/MembershipService';
import { MembershipRequest } from '../../components/cards/membershipCard/MembershipCard';

jest.mock('../../context/MembershipService', () => ({
    getOrganizationMembershipRequests: jest.fn(),
    acceptMembershipRequest: jest.fn(),
    denyMembershipRequest: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ orgId: 'test-org' }),
}));

jest.mock('../../components/cards/membershipCard/MembershipCard', () => {
    const MembershipCard = ({
        request,
        isSelected,
        onSelect,
    }: {
        request: any;
        isSelected: boolean;
        onSelect: (id: string) => void;
    }) => (
        <div
            data-testid="mock-membership-card"
            data-request-id={request.id}
            data-selected={isSelected}
            onClick={() => onSelect(request.id)}
        >
            {request.firstName} {request.lastName} ({request.userName})
        </div>
    );

    return {
        __esModule: true,
        default: MembershipCard,
    };
});

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

describe('Membership Component', () => {
    const mockRequests: MembershipRequest[] = [
        {
            id: '1',
            userId: 'user1',
            userName: 'johndoe',
            organizationId: 'test-org',
            requestDate: '2023-12-01T10:00:00Z',
            status: 'pending',
            firstName: 'John',
            lastName: 'Doe',
        },
        {
            id: '2',
            userId: 'user2',
            userName: 'janesmith',
            organizationId: 'test-org',
            requestDate: '2023-12-02T11:00:00Z',
            status: 'pending',
            firstName: 'Jane',
            lastName: 'Smith',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        (getOrganizationMembershipRequests as jest.Mock).mockResolvedValue({
            data: {
                requests: mockRequests,
            },
        });

        (acceptMembershipRequest as jest.Mock).mockResolvedValue({
            status: 'success',
        });

        (denyMembershipRequest as jest.Mock).mockResolvedValue({
            status: 'success',
        });
    });

    test('renders the page and fetches membership requests', async () => {
        await act(async () => {
            renderWithRouter(<Membership />);
        });

        expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('mock-top-bar')).toBeInTheDocument();
        expect(screen.getByText('Membership Requests')).toBeInTheDocument();

        expect(getOrganizationMembershipRequests).toHaveBeenCalledWith('test-org');

        await waitFor(() => {
            expect(screen.queryByText('Loading membership requests...')).not.toBeInTheDocument();
            expect(screen.getAllByTestId('mock-membership-card')).toHaveLength(2);
        });
    });

    test('displays an error message when fetching requests fails', async () => {
        (getOrganizationMembershipRequests as jest.Mock).mockRejectedValueOnce(
            new Error('Failed to fetch')
        );

        await act(async () => {
            renderWithRouter(<Membership />);
        });

        await waitFor(() => {
            expect(
                screen.getByText('Failed to load membership requests. Please try again later.')
            ).toBeInTheDocument();
        });
    });

    test('allows selecting a membership card', async () => {
        await act(async () => {
            renderWithRouter(<Membership />);
        });

        await waitFor(() => {
            expect(screen.getAllByTestId('mock-membership-card')).toHaveLength(2);
        });

        const card = screen.getAllByTestId('mock-membership-card')[0];

        await act(async () => {
            fireEvent.click(card);
        });

        expect(card).toHaveAttribute('data-selected', 'true');

        expect(screen.getByText('Accept Request')).toBeInTheDocument();
        expect(screen.getByText('Deny Request')).toBeInTheDocument();
    });

    test('accepts a membership request', async () => {
        await act(async () => {
            renderWithRouter(<Membership />);
        });

        await waitFor(() => {
            expect(screen.getAllByTestId('mock-membership-card')).toHaveLength(2);
        });

        const card = screen.getAllByTestId('mock-membership-card')[0];
        await act(async () => {
            fireEvent.click(card);
        });

        const acceptButton = screen.getByText('Accept Request');
        await act(async () => {
            fireEvent.click(acceptButton);
        });

        expect(acceptMembershipRequest).toHaveBeenCalledWith('test-org', '1');

        await waitFor(() => {
            expect(
                screen.getByText('Membership request accepted successfully.')
            ).toBeInTheDocument();

            expect(screen.getAllByTestId('mock-membership-card')).toHaveLength(1);
        });
    });

    test('denies a membership request', async () => {
        await act(async () => {
            renderWithRouter(<Membership />);
        });

        await waitFor(() => {
            expect(screen.getAllByTestId('mock-membership-card')).toHaveLength(2);
        });

        const card = screen.getAllByTestId('mock-membership-card')[0];
        await act(async () => {
            fireEvent.click(card);
        });

        const denyButton = screen.getByText('Deny Request');
        await act(async () => {
            fireEvent.click(denyButton);
        });

        expect(denyMembershipRequest).toHaveBeenCalledWith('test-org', '1');

        await waitFor(() => {
            expect(screen.getByText('Membership request denied successfully.')).toBeInTheDocument();

            expect(screen.getAllByTestId('mock-membership-card')).toHaveLength(1);
        });
    });

    test('filters requests based on search term', async () => {
        await act(async () => {
            renderWithRouter(<Membership />);
        });

        await waitFor(() => {
            expect(screen.getAllByTestId('mock-membership-card')).toHaveLength(2);
        });

        const searchInput = screen.getByPlaceholderText('Search membership requests...');

        await act(async () => {
            fireEvent.change(searchInput, { target: { value: 'Jane' } });
        });

        expect(screen.getAllByTestId('mock-membership-card')).toHaveLength(1);
        expect(screen.getByText('Jane Smith (janesmith)')).toBeInTheDocument();
        expect(screen.queryByText('John Doe (johndoe)')).not.toBeInTheDocument();

        await act(async () => {
            fireEvent.change(searchInput, { target: { value: '' } });
        });

        expect(screen.getAllByTestId('mock-membership-card')).toHaveLength(2);
    });
});
