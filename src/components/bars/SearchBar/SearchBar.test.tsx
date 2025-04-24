import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

// Mock react-bootstrap components and icons
jest.mock('react-bootstrap', () => {
    const InputGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return <div data-testid="mock-input-group">{children}</div>;
    };

    (InputGroup as any).Text = ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => {
        return (
            <div data-testid="mock-input-group-text" className={className}>
                {children}
            </div>
        );
    };

    const Form: React.FC<{
        children: React.ReactNode;
        onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
        className?: string;
    }> = ({ children, onSubmit, className }) => {
        return (
            <form data-testid="mock-form" onSubmit={onSubmit} className={className}>
                {children}
            </form>
        );
    };

    (Form as any).Control = ({
        id,
        type,
        placeholder,
        value,
        onChange,
        className,
        'aria-label': ariaLabel,
    }: {
        id?: string;
        type?: string;
        placeholder?: string;
        value?: string;
        onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
        className?: string;
        'aria-label'?: string;
    }) => {
        return (
            <input
                data-testid="mock-form-control"
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={className}
                aria-label={ariaLabel}
            />
        );
    };

    return {
        Form,
        InputGroup,
    };
});

jest.mock('react-bootstrap-icons', () => ({
    Search: () => <span data-testid="search-icon" />,
}));

describe('SearchBar Component', () => {
    const defaultProps = {
        value: '',
        onChange: jest.fn(),
    };

    test('renders with default props', () => {
        render(<SearchBar {...defaultProps} />);

        const form = screen.getByTestId('mock-form');
        expect(form).toHaveClass('search-bar-form');

        const input = screen.getByTestId('mock-form-control');
        expect(input).toHaveAttribute('placeholder', 'Search...');
        expect(input).toHaveAttribute('id', 'topBarSearch');
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveClass('form-input');
        expect(input).toHaveClass('search-input');

        const icon = screen.getByTestId('search-icon');
        expect(icon).toBeInTheDocument();
    });

    test('renders with custom placeholder', () => {
        render(<SearchBar {...defaultProps} placeholder="Find organizations..." />);

        const input = screen.getByTestId('mock-form-control');
        expect(input).toHaveAttribute('placeholder', 'Find organizations...');
    });

    test('applies custom class name', () => {
        render(<SearchBar {...defaultProps} className="custom-class" />);

        const form = screen.getByTestId('mock-form');
        expect(form).toHaveClass('custom-class');
        expect(form).toHaveClass('search-bar-form');
    });

    test('applies custom id', () => {
        render(<SearchBar {...defaultProps} id="customSearchId" />);

        const input = screen.getByTestId('mock-form-control');
        expect(input).toHaveAttribute('id', 'customSearchId');
    });

    test('calls onChange when input changes', () => {
        const handleChange = jest.fn();
        render(<SearchBar value="" onChange={handleChange} />);

        const input = screen.getByTestId('mock-form-control');
        fireEvent.change(input, { target: { value: 'search term' } });

        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    test('calls onSubmit when form is submitted', () => {
        const handleSubmit = jest.fn(e => e.preventDefault());
        render(<SearchBar value="" onChange={jest.fn()} onSubmit={handleSubmit} />);

        const form = screen.getByTestId('mock-form');
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('displays current value', () => {
        render(<SearchBar value="test search" onChange={jest.fn()} />);

        const input = screen.getByTestId('mock-form-control');
        expect(input).toHaveAttribute('value', 'test search');
    });
});
