import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthForm from './AuthForm';

// Mock react-bootstrap
jest.mock('react-bootstrap', () => ({
    Form: ({ children, onSubmit }: { children: React.ReactNode; onSubmit: any }) => (
        <form data-testid="form" onSubmit={onSubmit}>
            {children}
        </form>
    ),
    Alert: ({ children, variant }: { children: React.ReactNode; variant: string }) => (
        <div data-testid="alert" className={`alert alert-${variant}`}>
            {children}
        </div>
    ),
}));

describe('AuthForm Component', () => {
    const mockProps = {
        title: 'Test Title',
        onSubmit: jest.fn(e => e.preventDefault()),
        error: null,
        children: <div data-testid="form-children">Form fields</div>,
    };

    test('renders the form with title', () => {
        render(<AuthForm {...mockProps} />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByTestId('form')).toBeInTheDocument();
        expect(screen.getByTestId('form-children')).toBeInTheDocument();
    });

    test('does not render alert when no error', () => {
        render(<AuthForm {...mockProps} />);

        expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    });

    test('renders alert when error is provided', () => {
        render(<AuthForm {...mockProps} error="Test error message" />);

        const alert = screen.getByTestId('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveClass('alert-danger');
        expect(alert).toHaveTextContent('Test error message');
    });

    test('calls onSubmit when form is submitted', () => {
        render(<AuthForm {...mockProps} />);

        const form = screen.getByTestId('form');
        fireEvent.submit(form);

        expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
    });

    test('renders children inside the form', () => {
        const customChildren = <button data-testid="custom-button">Submit</button>;
        render(
            <AuthForm title="Test Form" onSubmit={mockProps.onSubmit} error={null}>
                {customChildren}
            </AuthForm>
        );

        const form = screen.getByTestId('form');
        expect(form).toContainElement(screen.getByTestId('custom-button'));
    });
});
