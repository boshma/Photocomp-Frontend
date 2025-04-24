import React from 'react';
import { render, screen } from '@testing-library/react';
import FormRow from './FormRow';

// Mock react-bootstrap components
jest.mock('react-bootstrap', () => ({
    Row: ({ children, className }: { children: React.ReactNode; className: string }) => (
        <div data-testid="mock-row" className={className}>
            {children}
        </div>
    ),
    Col: ({ children, className }: { children: React.ReactNode; className: string }) => (
        <div data-testid="mock-col" className={className}>
            {children}
        </div>
    ),
}));

describe('FormRow Component', () => {
    test('renders with proper row classes', () => {
        render(
            <FormRow>
                <div>Child 1</div>
            </FormRow>
        );

        const row = screen.getByTestId('mock-row');
        expect(row).toHaveClass('form-row');
        expect(row).toHaveClass('mb-2');
        expect(row).toHaveClass('w-100');
        expect(row).toHaveClass('mx-0');
    });

    test('wraps each child in a column', () => {
        render(
            <FormRow>
                <div>Child 1</div>
                <div>Child 2</div>
                <div>Child 3</div>
            </FormRow>
        );

        // Check that we have 3 columns
        const cols = screen.getAllByTestId(/mock-col/);
        expect(cols).toHaveLength(3);

        // Check each column has px-0 class
        cols.forEach(col => {
            expect(col).toHaveClass('px-0');
        });
    });

    test('handles single child correctly', () => {
        render(
            <FormRow>
                <div data-testid="single-child">Single Child</div>
            </FormRow>
        );

        const cols = screen.getAllByTestId(/mock-col/);
        expect(cols).toHaveLength(1);
        expect(screen.getByTestId('single-child')).toBeInTheDocument();
    });

    test('renders children correctly', () => {
        render(
            <FormRow>
                <div data-testid="child-1">Child 1</div>
                <div data-testid="child-2">Child 2</div>
            </FormRow>
        );

        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
});
