import React from 'react';
import { Form } from 'react-bootstrap';

interface FormInputProps {
    id: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    id,
    type,
    placeholder,
    value,
    onChange,
    required = false,
    className = '',
}) => {
    return (
        <Form.Group controlId={id} className={`${className}`}>
            <Form.Control
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className="form-input"
            />
        </Form.Group>
    );
};

export default FormInput;
