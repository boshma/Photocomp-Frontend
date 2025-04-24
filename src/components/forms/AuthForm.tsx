import React from 'react';
import { Form, Alert } from 'react-bootstrap';

interface AuthFormProps {
    title: string;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    error: string | null;
    children: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, onSubmit, error, children }) => {
    return (
        <div className="auth-form">
            <h1 className="auth-title">{title}</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={onSubmit}>{children}</Form>
        </div>
    );
};

export default AuthForm;
