import React from 'react';
import { Button } from 'react-bootstrap';

interface FormButtonProps {
    type: 'submit' | 'button' | 'reset';
    className?: string;
    variant?: string;
    onClick?: () => void;
    children: React.ReactNode;
    inverted?: boolean;
}

const FormButton: React.FC<FormButtonProps> = ({
    type,
    className = '',
    variant = 'primary',
    onClick,
    children,
    inverted = false,
}) => {
    // Use inverted styles if specified
    const buttonVariant = inverted ? 'light' : variant;
    const buttonClasses = `${className} ${inverted ? 'text-dark' : ''}`;

    return (
        <Button
            variant={buttonVariant}
            type={type}
            className={`mb-3 ${buttonClasses}`}
            onClick={onClick}
        >
            {children}
        </Button>
    );
};

export default FormButton;
