import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { ArrowLeft, BoxArrowRight } from 'react-bootstrap-icons';
import { useNavigate, NavLink } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import NavButton from '../../components/navButton/NavButton';
import FormInput from '../../components/forms/FormInput/FormInput';
import { changePassword, deleteAccount } from '../../context/AuthService';

interface AccountSettingsProps {
    className?: string;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ className = '' }) => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    // Form states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Handle password change
    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validation
        if (!currentPassword) {
            setError('Current password is required');
            return;
        }

        if (!newPassword) {
            setError('New password is required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            // Call the API to change password
            await changePassword(currentPassword, newPassword);

            // Set success message and reset form
            setSuccess('Password successfully updated');

            // Reset form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            console.error('Failed to update password:', err);
            // Check if the error has a specific message about incorrect password
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to update password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'Delete') {
            setError('Please type "Delete" to confirm account deletion');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            // Call the API to delete account
            if (user && user.id) {
                await deleteAccount(user.id);

                // Log out and redirect
                logout();
                navigate('/login');
            } else {
                throw new Error('User ID not found');
            }
        } catch (err: any) {
            console.error('Failed to delete account:', err);
            // Check if the error has a specific message
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to delete account. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel changes
    const handleCancel = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setDeleteConfirmation('');
        setError(null);
        setSuccess(null);
    };

    return (
        <div className={`account-settings bg-dark text-light min-vh-100 ${className}`}>
            {/* Header - No border */}
            <div className="py-3">
                <Container fluid>
                    <Row className="align-items-center">
                        <Col xs={3} className="d-flex align-items-center">
                            <NavLink to="/" className="text-light text-decoration-none">
                                <ArrowLeft className="me-2" />
                                Back to Home
                            </NavLink>
                        </Col>
                        <Col xs={6} className="text-center">
                            <h2 className="mb-0">Account Settings</h2>
                        </Col>
                        <Col xs={3} className="text-end">
                            <NavLink to="/logout" className="text-light">
                                <BoxArrowRight size={24} />
                            </NavLink>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Main Content */}
            <Container fluid className="py-3">
                {/* Account Info Section */}
                <Row className="justify-content-center mb-5">
                    <Col xs={12} md={8} lg={6}>
                        <h3 className="text-center mb-3">Personal Information</h3>

                        {/* Display user information */}
                        <div className="user-info mb-5">
                            <p className="text-center mb-3" style={{ fontSize: '1.50rem' }}>
                                Account name: {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-center mb-3" style={{ fontSize: '1.50rem' }}>
                                Account Email: {user?.email}
                            </p>
                            <p className="text-center mb-5" style={{ fontSize: '1.50rem' }}>
                                Account Type:{' '}
                                {user?.role
                                    ? user.role.charAt(0).toUpperCase() +
                                      user.role.slice(1).toLowerCase()
                                    : 'User'}
                            </p>
                        </div>

                        {/* Combined form for both password change and delete account to avoid separation */}
                        <div className="account-actions">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success" role="alert">
                                    {success}
                                </div>
                            )}

                            {/* Password change section */}
                            <div className="password-change mb-5">
                                <Form.Group className="mb-4" controlId="currentPassword">
                                    <Form.Label>Current Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter current password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        className="bg-white text-dark border-secondary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="newPassword">
                                    <Form.Label>New Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="bg-white text-dark border-secondary"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="confirmPassword">
                                    <Form.Label>Confirm Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="bg-white text-dark border-secondary"
                                    />
                                </Form.Group>

                                {/* Password change buttons */}
                                <div className="d-flex justify-content-between mb-5">
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        style={{
                                            minWidth: '160px',
                                            height: '35px',
                                            fontSize: '14px',
                                            whiteSpace: 'nowrap',
                                            paddingLeft: '8px',
                                            paddingRight: '8px',
                                            marginLeft: '-50px', // Move button LEFT by 50px
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={e => {
                                            e.preventDefault();
                                            handlePasswordChange(e as any);
                                        }}
                                        disabled={isLoading}
                                        style={{
                                            minWidth: '160px',
                                            height: '35px',
                                            fontSize: '14px',
                                            whiteSpace: 'nowrap',
                                            paddingLeft: '8px',
                                            paddingRight: '8px',
                                            marginRight: '-50px', // Move button RIGHT by 50px
                                        }}
                                    >
                                        {isLoading ? 'Processing...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>

                            {/* Delete Account Section - No border or margin that would create a line, with space between heading and content */}
                            <div
                                className="delete-section"
                                style={{ borderTop: 'none', marginTop: '-20px' }}
                            >
                                <h4 className="text-center mb-4 fs-5">Delete Account?</h4>

                                {/* For medium screens and up - inline display */}
                                <div className="d-none d-md-flex align-items-center justify-content-center">
                                    <Form.Label htmlFor="deleteConfirmation" className="me-3 mb-0">
                                        Type "Delete" to confirm:
                                    </Form.Label>
                                    <Form.Control
                                        id="deleteConfirmation"
                                        type="text"
                                        placeholder="Type 'Delete'"
                                        value={deleteConfirmation}
                                        onChange={e => setDeleteConfirmation(e.target.value)}
                                        className="bg-white text-dark border-secondary me-3"
                                        style={{ width: '150px' }}
                                    />
                                    <Button
                                        variant="danger"
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirmation !== 'Delete' || isLoading}
                                        className="px-3 py-1"
                                        size="sm"
                                    >
                                        {isLoading ? 'Processing...' : 'Delete Account'}
                                    </Button>
                                </div>

                                {/* For small screens - stacked display with smaller text */}
                                <div className="d-flex d-md-none flex-column align-items-center">
                                    <Form.Label
                                        htmlFor="deleteConfirmationMobile"
                                        className="mb-1 small"
                                    >
                                        Type "Delete" to confirm:
                                    </Form.Label>
                                    <div className="d-flex mb-2 align-items-center">
                                        <Form.Control
                                            id="deleteConfirmationMobile"
                                            type="text"
                                            placeholder="Type 'Delete'"
                                            value={deleteConfirmation}
                                            onChange={e => setDeleteConfirmation(e.target.value)}
                                            className="bg-white text-dark border-secondary me-2"
                                            style={{ width: '120px' }}
                                            size="sm"
                                        />
                                        <Button
                                            variant="danger"
                                            onClick={handleDeleteAccount}
                                            disabled={deleteConfirmation !== 'Delete' || isLoading}
                                            className="px-2 py-1"
                                            size="sm"
                                        >
                                            {isLoading ? '...' : 'Delete'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AccountSettings;
