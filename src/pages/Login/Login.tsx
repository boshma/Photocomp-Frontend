// import '../../styles/auth.css';
import AuthContext from '../../context/AuthContext';
import { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { loginUser } from '../../context/AuthService';
import { ArrowLeft } from 'react-bootstrap-icons';

import FormContainer from '../../components/forms/FormContainer/FormContainer';
import AuthForm from '../../components/forms/AuthForm/AuthForm';
import FormInput from '../../components/forms/FormInput/FormInput';
import FormButton from '../../components/forms/FormButton/FormButton';
import NavButton from '../../components/navButton/NavButton';

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
            <NavLink to="/" className="back-button text-white">
                <ArrowLeft className="me-1" />
                Back to home
            </NavLink>
            <AuthForm title="PHOTOCOMP" onSubmit={handleSubmit} error={error}>
                <FormInput
                    id="formEmail"
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={handleChange}
                    className="w-100 mb-3"
                    required
                />

                <FormInput
                    id="formPassword"
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    className="w-100 mb-3"
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
