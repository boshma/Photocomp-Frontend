import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import GalleryCard from './GalleryCard';
import { renderWithRouter } from '../../../utils/test-utils';

jest.mock('react-bootstrap', () => ({
    Card: ({
        children,
        className,
        onClick,
        style,
    }: {
        children: React.ReactNode;
        className: string;
        onClick: () => void;
        style: React.CSSProperties;
    }) => (
        <div data-testid="mock-card" className={className} onClick={onClick} style={style}>
            {children}
        </div>
    ),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('GalleryCard Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    test('renders organization card correctly', () => {
        const organization = {
            id: '123',
            name: 'Test Organization',
            description: 'This is a test organization',
            logoUrl: 'https://example.com/logo.jpg',
            PK: 'ORG#TESTORG',
        };

        renderWithRouter(<GalleryCard item={organization} className="organization-card" orgName={organization.name}/>);

        const card = screen.getByTestId('mock-card');
        expect(card).toHaveClass('organization-card');
        expect(screen.getByText('Test Organization')).toBeInTheDocument();
        expect(screen.getByText('This is a test organization')).toBeInTheDocument();
        expect(card).toHaveStyle(`background-image: url(${organization.logoUrl})`);
    });

    test('navigates to organization page when organization card is clicked', () => {
        const organization = {
            id: '123',
            name: 'Test Organization',
            PK: 'ORG#TESTORG',
            orgName: 'testorg'
        };

        renderWithRouter(<GalleryCard item={organization} className="organization-card" orgName={organization.orgName} />);

        const card = screen.getByTestId('mock-card');
        fireEvent.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/organizations/testorg/events');
    });

    test('renders event card correctly', () => {
        const event = {
            id: '456',
            title: 'Test Event',
            description: 'This is a test event',
            GSI2PK: 'ORG#TESTORG',
        };

        renderWithRouter(<GalleryCard item={event} className="event" orgName={event.GSI2PK} />);

        const card = screen.getByTestId('mock-card');
        expect(card).toHaveClass('event');
        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('This is a test event')).toBeInTheDocument();

        expect(screen.getByText('TESTORG')).toBeInTheDocument();
    });

    test('navigates to event page when event card is clicked', () => {
        const event = {
            id: '456',
            title: 'Test Event',
            GSI2PK: 'ORG#TESTORG',
            orgName: 'Testorg',
        };
    });


});
