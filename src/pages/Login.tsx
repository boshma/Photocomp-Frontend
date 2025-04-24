import '../styles/auth.css';
import AuthContext from '../context/AuthContext';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../context/AuthService';

import FormContainer from '../components/forms/FormContainer';
import AuthForm from '../components/forms/AuthForm';
import FormInput from '../components/forms/FormInput';
import FormButton from '../components/forms/FormButton';

const Login: React.FC = () => {
    const context = useContext(AuthContext);
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [id.replace('form', '').toLowerCase()]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { email, password } = credentials;

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setError(null);

        try {
            const response = await loginUser({ email, password });
            const token = response.data.data.token;
            const user = response.data.data.user;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            context?.setToken(token);
            context?.setUser(user);
            navigate('/');
        } catch (error) {
            console.error(error);
            setError('Login Failed.');
        }
    };

    return (
        <FormContainer>
            <AuthForm title="PHOTOCOMP" onSubmit={handleSubmit} error={error}>
                <FormInput
                    id="formEmail"
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    id="formPassword"
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />

                <FormButton type="submit" variant="light">
                    Login
                </FormButton>

                <FormButton type="button" onClick={() => navigate('/register')}>
                    Don't have an account? Register
                </FormButton>
            </AuthForm>
        </FormContainer>
    );
};

export default Login;
