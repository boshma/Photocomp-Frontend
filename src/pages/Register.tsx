import '../styles/auth.css';
import AuthContext from '../context/AuthContext';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../context/AuthService';

// Import our custom components
import FormContainer from '../components/forms/FormContainer';
import AuthForm from '../components/forms/AuthForm';
import FormInput from '../components/forms/FormInput';
import FormButton from '../components/forms/FormButton';

const Register: React.FC = () => {
    const context = useContext(AuthContext);
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        email: '',
        password: '',
        username: '',
        firstName: '',
        lastName: '',
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [id.replace('form', '').toLowerCase()]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { email, password, username, firstName, lastName } = userData;

        if (!email || !password || !username || !firstName || !lastName) {
            setError('Please fill in all fields');
            return;
        }
        setError(null);

        try {
            const response = await registerUser({ email, password, username, firstName, lastName });
            const token = response.data.data.token;
            const user = response.data.data.user;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            context?.setToken(token);
            context?.setUser(user);
            navigate('/');
        } catch (error) {
            console.error(error);
            setError('Registration Failed.');
        }
    };

    return (
        <FormContainer>
            <AuthForm title="PHOTOCOMP" onSubmit={handleSubmit} error={error}>
                <FormInput
                    id="formEmail"
                    type="email"
                    placeholder="Email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    id="formPassword"
                    type="password"
                    placeholder="Password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    id="formUsername"
                    type="text"
                    placeholder="Username"
                    value={userData.username}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    id="formFirstName"
                    type="text"
                    placeholder="First Name"
                    value={userData.firstName}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    id="formLastName"
                    type="text"
                    placeholder="Last Name"
                    value={userData.lastName}
                    onChange={handleChange}
                    required
                />

                <FormButton type="submit" variant="light">
                    Register
                </FormButton>

                <FormButton type="button" onClick={() => navigate('/login')}>
                    Already have an account? Login
                </FormButton>
            </AuthForm>
        </FormContainer>
    );
};

export default Register;
