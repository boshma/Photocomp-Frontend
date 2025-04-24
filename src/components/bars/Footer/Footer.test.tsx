import React from 'react';
import { screen } from '@testing-library/react';
import Footer from './Footer';
import { renderWithRouter } from '../../../utils/test-utils';

jest.mock('react-bootstrap', () => ({
    Container: ({
        children,
        fluid,
        className,
    }: {
        children: React.ReactNode;
        fluid: boolean;
        className: string;
    }) => (
        <div data-testid="mock-container" data-fluid={fluid} className={className}>
            {children}
        </div>
    ),
}));

describe('Footer Component', () => {
    test('renders with copyright text', () => {
        renderWithRouter(<Footer />);

        const currentYear = new Date().getFullYear().toString();
        expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
        expect(
            screen.getByText(new RegExp(`© ${currentYear} PHOTOCOMP`, 'i'))
        ).toBeInTheDocument();
    });

    test('renders content policy link', () => {
        renderWithRouter(<Footer />);

        const link = screen.getByText(/content policy/i);
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/content-policy');
    });

    test('applies custom class name', () => {
        renderWithRouter(<Footer className="custom-class" />);

        const footer = screen.getByRole('contentinfo');
        expect(footer).toHaveClass('custom-class');
        expect(footer).toHaveClass('footer');
    });

    test('renders inside a fluid container', () => {
        renderWithRouter(<Footer />);

        const container = screen.getByTestId('mock-container');
        expect(container).toHaveAttribute('data-fluid', 'true');
        expect(container).toHaveClass('d-flex');
    });
});
