import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import NavButton from './NavButton';
import { renderWithRouter } from '../../utils/test-utils';

jest.mock('react-bootstrap', () => ({
    Button: ({
        children,
        variant,
        className,
        onClick,
    }: {
        children: React.ReactNode;
        variant: string;
        className: string;
        onClick: () => void;
    }) => (
        <button
            data-testid="mock-button"
            data-variant={variant}
            className={className}
            onClick={onClick}
        >
            {children}
        </button>
    ),
}));

jest.mock('react-bootstrap-icons', () => ({
    ArrowLeft: () => <span data-testid="arrow-left-icon" />,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('NavButton Component', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    test('renders with default props', () => {
        renderWithRouter(<NavButton />);

        const button = screen.getByTestId('mock-button');
        expect(button).toHaveTextContent('Back');
        expect(button).toHaveAttribute('data-variant', 'primary custom-create-button');
    });

    test('renders with custom text', () => {
        renderWithRouter(<NavButton>Go Home</NavButton>);

        const button = screen.getByTestId('mock-button');
        expect(button).toHaveTextContent('Go Home');
    });

    test('applies custom class names', () => {
        renderWithRouter(<NavButton className="custom-class">Back</NavButton>);

        const button = screen.getByTestId('mock-button');
        expect(button).toHaveClass('custom-class');
    });

    test('applies custom variant', () => {
        renderWithRouter(<NavButton variant="outline-dark">Back</NavButton>);

        const button = screen.getByTestId('mock-button');
        expect(button).toHaveAttribute('data-variant', 'outline-dark custom-create-button');
    });

    test('navigates to specified route when clicked', () => {
        const { rerender } = renderWithRouter(
            <NavButton to="/dashboard">Back to dashboard</NavButton>
        );

        const button = screen.getByTestId('mock-button');
        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

        mockNavigate.mockClear();
        rerender(<NavButton>Back</NavButton>);

        const defaultButton = screen.getByTestId('mock-button');
        fireEvent.click(defaultButton);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
