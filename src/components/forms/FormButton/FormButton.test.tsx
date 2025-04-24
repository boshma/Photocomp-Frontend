import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormButton from './FormButton';

// Mock react-bootstrap Button
jest.mock('react-bootstrap', () => ({
    Button: ({
        children,
        variant,
        type,
        className,
        onClick,
    }: {
        children: React.ReactNode;
        variant: string;
        type: 'submit' | 'reset' | 'button' | undefined;
        className: string;
        onClick?: () => void;
    }) => (
        <button
            data-testid="mock-button"
            data-variant={variant}
            type={type}
            className={className}
            onClick={onClick}
        >
            {children}
        </button>
    ),
}));

describe('FormButton Component', () => {
    test('renders with default props', () => {
        render(<FormButton type="button">Click Me</FormButton>);

        const button = screen.getByTestId('mock-button');
        expect(button).toHaveTextContent('Click Me');
        expect(button).toHaveAttribute('data-variant', 'primary');
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toHaveAttribute('class', expect.stringContaining('mb-3'));
    });

    test('applies custom class names', () => {
        render(
            <FormButton type="submit" className="custom-class">
                Submit
            </FormButton>
        );

        const button = screen.getByTestId('mock-button');
        expect(button).toHaveAttribute('class', expect.stringContaining('custom-class'));
        expect(button).toHaveAttribute('class', expect.stringContaining('mb-3'));
    });

    test('applies custom variant', () => {
        render(
            <FormButton type="button" variant="success">
                Success Button
            </FormButton>
        );

        const button = screen.getByTestId('mock-button');
        expect(button).toHaveAttribute('data-variant', 'success');
    });

    test('applies inverted styles', () => {
        render(
            <FormButton type="button" inverted>
                Inverted Button
            </FormButton>
        );

        const button = screen.getByTestId('mock-button');
        expect(button).toHaveAttribute('data-variant', 'light');
        expect(button).toHaveAttribute('class', expect.stringContaining('text-dark'));
    });

    test('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(
            <FormButton type="button" onClick={handleClick}>
                Clickable
            </FormButton>
        );

        const button = screen.getByTestId('mock-button');
        fireEvent.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('renders as submit button', () => {
        render(<FormButton type="submit">Submit Form</FormButton>);

        const button = screen.getByTestId('mock-button');
        expect(button).toHaveAttribute('type', 'submit');
    });
});
