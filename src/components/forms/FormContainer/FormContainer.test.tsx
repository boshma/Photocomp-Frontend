import React from 'react';
import { render, screen } from '@testing-library/react';
import FormContainer from './FormContainer';

// Mock react-bootstrap components
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
    Row: ({ children, className }: { children: React.ReactNode; className: string }) => (
        <div data-testid="mock-row" className={className}>
            {children}
        </div>
    ),
    Col: ({
        children,
        xs,
        className,
    }: {
        children: React.ReactNode;
        xs: number;
        className: string;
    }) => (
        <div data-testid="mock-col" data-xs={xs} className={className}>
            {children}
        </div>
    ),
}));

describe('FormContainer Component', () => {
    test('renders container with fluid and proper classes', () => {
        const testContent = <div data-testid="test-content">Test Content</div>;
        render(<FormContainer>{testContent}</FormContainer>);

        const container = screen.getByTestId('mock-container');
        expect(container).toHaveAttribute('data-fluid', 'true');
        expect(container).toHaveClass('form-container');
        expect(container).toHaveClass('d-flex');
        expect(container).toHaveClass('align-items-center');
        expect(container).toHaveClass('justify-content-center');
        expect(container).toHaveClass('min-vh-100');
    });

    test('renders row with centered content', () => {
        render(
            <FormContainer>
                <div>Content</div>
            </FormContainer>
        );

        const row = screen.getByTestId('mock-row');
        expect(row).toHaveClass('justify-content-center');
    });

    test('renders column with proper xs value and classes', () => {
        render(
            <FormContainer>
                <div>Content</div>
            </FormContainer>
        );

        const col = screen.getByTestId('mock-col');
        expect(col).toHaveAttribute('data-xs', '12');
        expect(col).toHaveClass('d-flex');
        expect(col).toHaveClass('justify-content-center');
    });

    test('renders children inside the container structure', () => {
        const testContent = <div data-testid="test-content">Test Content</div>;
        render(<FormContainer>{testContent}</FormContainer>);

        expect(screen.getByTestId('test-content')).toBeInTheDocument();
        const col = screen.getByTestId('mock-col');
        expect(col).toContainElement(screen.getByTestId('test-content'));
    });
});
