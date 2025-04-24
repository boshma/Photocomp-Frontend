import React from 'react';
import { Form } from 'react-bootstrap';

interface FormInputProps {
    id: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
    id,
    type,
    placeholder,
    value,
    onChange,
    required = false,
}) => {
    return (
        <Form.Group controlId={id} className="w-100 mb-2">
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
