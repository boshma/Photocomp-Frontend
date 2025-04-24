import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
    to?: string;
    className?: string;
    variant?: string;
    children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({
    to = '/',
    className = '',
    variant = 'primary',
    children,
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(to);
    };

    return (
        <Button
            className={`${className}`}
            variant={`${variant} custom-create-button`}
            onClick={handleClick}
        >
            {children || 'Back'}
        </Button>
    );
};

export default BackButton;
