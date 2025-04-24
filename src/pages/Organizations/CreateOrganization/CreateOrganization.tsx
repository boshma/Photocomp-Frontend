import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createOrganization } from '../../../context/OrgService';
import AuthContext from '../../../context/AuthContext';
import * as icon from 'react-bootstrap-icons';

// Import components
import Sidebar from '../../../components/bars/SideBar/SideBar';
import TopBar from '../../../components/bars/TopBar/TopBar';
import SearchBar from '../../../components/bars/SearchBar/SearchBar';
import NavButton from '../../../components/navButton/NavButton';
import { NavLink } from 'react-router-dom';

interface OrganizationData {
    name: string;
    description?: string;
    logo: File | null;
}

const CreateOrganization: React.FC = () => {
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [organizationData, setOrganizationData] = useState<OrganizationData>({
        name: '',
        description: '',
        logo: null,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrganizationData({
            ...organizationData,
            name: e.target.value,
        });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setOrganizationData({
            ...organizationData,
            description: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Check file type
            if (!file.type.match('image.*')) {
                setError('Please select an image file');
                return;
            }

            // Check file size (e.g., limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size should not exceed 5MB');
                return;
            }

            setOrganizationData({
                ...organizationData,
                logo: file,
            });

            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);

            setError(null);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    /* Components to be injected into the TopBar*/
    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search organizations..."
            className="ms-3"
        />
    );

    /* Components to be injected into the TopBar*/
    const rightComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {user && token ? (
                    <>
                        <NavLink to="/account-settings" className="text-light top-bar-element">
                            <icon.GearFill size={24} />
                        </NavLink>
                        <NavLink to="/logout" className="text-light top-bar-element">
                            <icon.BoxArrowRight size={24} />
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavButton
                            to="/register"
                            variant="outline-light"
                            className="mx-1 top-bar-element"
                        >
                            Register
                        </NavButton>
                        <NavButton to="/login" variant="outline-light" className="top-bar-element">
                            Login
                        </NavButton>
                    </>
                )}
            </div>
        </>
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Form validation
        if (!organizationData.name.trim()) {
            setError('Organization name is required');
            return;
        }

        if (!organizationData.logo) {
            setError('Organization logo is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // Create form data for file upload
        const formData = new FormData();
        formData.append('name', organizationData.name);

        if (organizationData.description) {
            formData.append('description', organizationData.description);
        }

        if (organizationData.logo) {
            formData.append('logo', organizationData.logo);
        }

        try {
            // Make API call to create organization
            const response = await createOrganization(formData);
            console.log('Organization created successfully:', response);

            setSuccess('Organization created successfully!');

            // Redirect to organizations page after a short delay
            setTimeout(() => {
                navigate('/organizations');
            }, 1500);
        } catch (error: any) {
            console.error('Error creating organization:', error);

            // Handle specific error messages from the API
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('Failed to create organization. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Row className="g-0">
                <Col md="auto" className="sidebar-container">
                    <Sidebar />
                </Col>
                <Col className="main-content p-0">
                    <div className="sticky-top bg-dark z-3">
                        <Row>
                            <TopBar
                                rightComponents={rightComponents}
                            />
                        </Row>
                    </div>
                    <div className="create-organization-page bg-dark text-light min-vh-100">
                        {/* Main Content */}
                        <Container fluid className="px-4 pt-4">
                            <Row className="justify-content-center">
                                <Col xs={12} md={8} lg={6}>
                                    <h1
                                        className="text-center mb-5"
                                        style={{ fontFamily: 'Michroma, sans-serif' }}
                                    >
                                        Organizations
                                    </h1>

                                    <div className="text-center mb-5">
                                        <h2
                                            className="fs-1"
                                            style={{ fontFamily: 'Michroma, sans-serif' }}
                                        >
                                            Start to create your Organization below!
                                        </h2>
                                    </div>

                                    {error && (
                                        <Alert variant="danger" className="my-3">
                                            {error}
                                        </Alert>
                                    )}

                                    {success && (
                                        <Alert variant="success" className="my-3">
                                            {success}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-4" controlId="organizationName">
                                            <Form.Label
                                                style={{ fontFamily: 'Michroma, sans-serif' }}
                                                className="fs-4"
                                            >
                                                Organization Name
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter organization name"
                                                value={organizationData.name}
                                                onChange={handleNameChange}
                                                className="bg-white border-secondary py-3"
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group
                                            className="mb-4"
                                            controlId="organizationDescription"
                                        >
                                            <Form.Label
                                                style={{ fontFamily: 'Michroma, sans-serif' }}
                                                className="fs-4"
                                            >
                                                Organization Description
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                placeholder="Enter organization description"
                                                value={organizationData.description}
                                                onChange={handleDescriptionChange}
                                                className="bg-white border-secondary py-3"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4" controlId="organizationLogo">
                                            <Form.Label
                                                style={{ fontFamily: 'Michroma, sans-serif' }}
                                                className="fs-4"
                                            >
                                                Upload your Organization logo
                                            </Form.Label>

                                            {previewUrl && (
                                                <div className="mb-3 text-center">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Logo preview"
                                                        style={{
                                                            maxHeight: '200px',
                                                            maxWidth: '100%',
                                                        }}
                                                        className="border rounded"
                                                    />
                                                </div>
                                            )}

                                            {/* File upload wrapper with controlled width */}
                                            <div>
                                                <div style={{ width: '66.7%' }}>
                                                    {' '}
                                                    {/* This makes it 2/3 width */}
                                                    <Form.Control
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        className="bg-white text-dark border-secondary rounded-3"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </Form.Group>

                                        <div
                                            className="position-relative p-3 mt-5 pt-5"
                                            style={{ height: '250px', zIndex: 1100 }}
                                        >
                                            <div
                                                className="position-absolute"
                                                style={{
                                                    left: '-200px',
                                                    top: '200px',
                                                    zIndex: 1100,
                                                }}
                                            >
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => navigate('/organizations')}
                                                    disabled={isSubmitting}
                                                    className="py-2 px-4"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>

                                            <div
                                                className="position-absolute"
                                                style={{
                                                    right: '-200px',
                                                    top: '200px',
                                                    zIndex: 1100,
                                                }}
                                            >
                                                <Button
                                                    variant="secondary"
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="py-2 px-4"
                                                >
                                                    {isSubmitting
                                                        ? 'Creating...'
                                                        : 'Create Organization'}
                                                </Button>
                                            </div>
                                        </div>
                                    </Form>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default CreateOrganization;
