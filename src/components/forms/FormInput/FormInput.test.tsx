import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from './FormInput';

// Mock react-bootstrap Form components
jest.mock('react-bootstrap', () => ({
    Form: {
        Group: ({
            children,
            controlId,
            className,
        }: {
            children: React.ReactNode;
            controlId: string;
            className: string;
        }) => (
            <div data-testid="form-group" data-control-id={controlId} className={className}>
                {children}
            </div>
        ),
        Control: ({
            type,
            placeholder,
            value,
            onChange,
            required,
            className,
        }: {
            type: string;
            placeholder: string;
            value: string;
            onChange: (e: any) => void;
            required: boolean;
            className: string;
        }) => (
            <input
                data-testid="form-control"
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className={className}
            />
        ),
    },
}));

describe('FormInput Component', () => {
    const defaultProps = {
        id: 'testInput',
        type: 'text',
        placeholder: 'Enter value',
        value: '',
        onChange: jest.fn(),
    };

    test('renders with default props', () => {
        render(<FormInput {...defaultProps} />);

        const formGroup = screen.getByTestId('form-group');
        const input = screen.getByTestId('form-control');

        expect(formGroup).toHaveAttribute('data-control-id', 'testInput');
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveAttribute('placeholder', 'Enter value');
        expect(input).toHaveAttribute('value', '');
        expect(input).not.toHaveAttribute('required');
        expect(input).toHaveClass('form-input');
    });

    test('renders as required input', () => {
        render(<FormInput {...defaultProps} required />);

        const input = screen.getByTestId('form-control');
        expect(input).toHaveAttribute('required');
    });

    test('applies custom class name', () => {
        render(<FormInput {...defaultProps} className="custom-class" />);

        const formGroup = screen.getByTestId('form-group');
        expect(formGroup).toHaveClass('custom-class');
    });

    test('renders with different input types', () => {
        const { rerender } = render(<FormInput {...defaultProps} type="email" />);

        expect(screen.getByTestId('form-control')).toHaveAttribute('type', 'email');

        rerender(<FormInput {...defaultProps} type="password" />);
        expect(screen.getByTestId('form-control')).toHaveAttribute('type', 'password');
    });

    test('calls onChange when input changes', () => {
        render(<FormInput {...defaultProps} />);

        const input = screen.getByTestId('form-control');
        fireEvent.change(input, { target: { value: 'new value' } });

        expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    });

    test('displays current value', () => {
        render(<FormInput {...defaultProps} value="current value" />);

        const input = screen.getByTestId('form-control');
        expect(input).toHaveAttribute('value', 'current value');
    });
});
