// import '../../styles/auth.css';
import AuthContext from '../../context/AuthContext';
import { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { registerUser } from '../../context/AuthService';
import { ArrowLeft } from 'react-bootstrap-icons';

import FormContainer from '../../components/forms/FormContainer/FormContainer';
import AuthForm from '../../components/forms/AuthForm/AuthForm';
import FormInput from '../../components/forms/FormInput/FormInput';
import FormButton from '../../components/forms/FormButton/FormButton';
import FormRow from '../../components/forms/FormRow/FormRow';
import NavButton from '../../components/navButton/NavButton';

const Register: React.FC = () => {
    const context = useContext(AuthContext);
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [id.replace('form', '')]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { email, password, firstName, lastName } = userData;

        if (!email || !password || !firstName || !lastName) {
            setError('Please fill in all fields');
            return;
        }
        setError(null);

        try {
            const response = await registerUser({ email, password, firstName, lastName });
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
            <NavLink to="/" className="back-button text-white">
                <ArrowLeft className="me-1" />
                Back to home
            </NavLink>
            <AuthForm title="PHOTOCOMP" onSubmit={handleSubmit} error={error}>
                <FormRow>
                    <FormInput
                        id="formfirstName"
                        type="text"
                        placeholder="First Name"
                        value={userData.firstName}
                        onChange={handleChange}
                        required
                        className="mb-2"
                    />
                    <FormInput
                        id="formlastName"
                        type="text"
                        placeholder="Last Name"
                        value={userData.lastName}
                        onChange={handleChange}
                        required
                        className="mb-2"
                    />
                </FormRow>

                <FormInput
                    id="formemail"
                    type="email"
                    placeholder="Email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                    className="w-100 mb-3"
                />

                <FormInput
                    id="formpassword"
                    type="password"
                    placeholder="Password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                    className="w-100 mb-3"
                />

                <FormButton type="submit" variant="light" className="w-100">
                    Register
                </FormButton>

                <FormButton type="button" onClick={() => navigate('/login')} className="w-100">
                    Already have an account? Login
                </FormButton>
            </AuthForm>
        </FormContainer>
    );
};

export default Register;
