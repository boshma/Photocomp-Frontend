import React, { useState, useEffect, useContext, useRef } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { getPublicOrganizations, updateOrganization, Organization } from '../../context/OrgService';
import { isMemberOfOrg } from '../../context/AuthService';

import AuthContext from '../../context/AuthContext';
import * as icon from 'react-bootstrap-icons';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';

const OrganizationDetails: React.FC = () => {
    const { id: organizationId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const fetchedRef = useRef(false);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [orgRole, setOrgRole] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isAdmin = orgRole === 'ADMIN';
    const [formData, setFormData] = useState({
        description: '',
        contactEmail: '',
        website: '',
        logo: null as File | null,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (fetchedRef.current || !organizationId) return;
        fetchedRef.current = true;
        fetchOrganization();
        checkMembership();
    }, [organizationId]);

    const fetchOrganization = async () => {
        if (!organizationId) return;

        try {
            let page = 1;
            let foundOrg: Organization | undefined;
            const maxPages = 100;

            while (page <= maxPages) {
                const response = await getPublicOrganizations(page as unknown as string);
                const orgs = response?.data?.organizations;
                if (!orgs || orgs.length === 0) break;

                foundOrg = orgs.find(
                    (org: Organization) => org.name.toLowerCase() === organizationId.toLowerCase()
                );
                if (foundOrg) break;

                page++;
            }

            if (!foundOrg) {
                setError('Organization not found');
                return;
            }

            setOrganization(foundOrg);
            setFormData({
                description: foundOrg.description || '',
                contactEmail: foundOrg.contactEmail || '',
                website: foundOrg.website || '',
                logo: null,
            });
            if (foundOrg.logoUrl) {
                setPreviewUrl(foundOrg.logoUrl);
            }
        } catch (err) {
            console.error('Error fetching organization details:', err);
            setError('Failed to load organization details. Please try again.');
        }
    };

    const checkMembership = async () => {
        if (!organizationId || !user?.id) return;

        try {
            const res = await isMemberOfOrg(user.id, organizationId);
            const role = res?.data?.data?.membership?.role;
            setOrgRole(role);
        } catch (err) {
            setOrgRole(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (!file.type.match('image.*')) {
                setError('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File size should not exceed 5MB');
                return;
            }

            setFormData(prev => ({ ...prev, logo: file }));

            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
            };
            reader.readAsDataURL(file);

            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organizationId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const updateData = new FormData();
            updateData.append('description', formData.description);
            updateData.append('contactEmail', formData.contactEmail);
            updateData.append('website', formData.website);
            if (formData.logo) {
                updateData.append('logo', formData.logo);
            }

            await updateOrganization(organizationId, updateData);

            const refreshResponse = await getPublicOrganizations();
            const refreshedOrg = refreshResponse.data.organizations.find(
                (org: Organization) => org.id === organizationId
            );

            if (refreshedOrg) {
                setOrganization(refreshedOrg);
                setFormData({
                    description: refreshedOrg.description || '',
                    contactEmail: refreshedOrg.contactEmail || '',
                    website: refreshedOrg.website || '',
                    logo: null,
                });
                setPreviewUrl(refreshedOrg.logoUrl || null);
            }

            setSuccess('Organization updated successfully!');
            navigate(-1);
        } catch (err) {
            console.error('Error updating organization:', err);
            setError('Failed to update organization. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search organizations..."
            className="ms-3"
        />
    );

    const rightComponents = (
        <div className="d-flex align-items-center gap-3">
            {user ? (
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
    );

    return (
        <Row className="g-0">
            <Col md="auto" className="sidebar-container">
                <Sidebar />
            </Col>
            <Col className="main-content p-0">
                <div className="sticky-top bg-dark z-3">
                    <TopBar searchComponent={searchComponent} rightComponents={rightComponents} />
                </div>

                <Container fluid className="px-4 pt-4 bg-dark text-light min-vh-100">
                    <div className="organization-details-page bg-dark text-light min-vh-100">
                        {error ? (
                            <>
                                <Alert variant="danger" className="my-4">
                                    {error}
                                </Alert>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate('/organizations')}
                                >
                                    Back to Organizations
                                </Button>
                            </>
                        ) : (
                            <Form onSubmit={handleSubmit}>
                                <Row className="align-items-center mb-4 justify-content-center">
                                    <h2 style={{ fontFamily: 'Michroma, sans-serif' }}>
                                        Organization Details
                                    </h2>
                                </Row>
                                <Row>
                                    <Col md={8} lg={6}>
                                        <Form.Group controlId="organizationName">
                                            <Form.Label>Organization Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={organization?.name || ''}
                                                readOnly
                                                plaintext
                                                className="text-light bg-dark border-0"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="description">
                                            <Row className="align-items-center">
                                                <Col md={4}>
                                                    <Form.Label>Description</Form.Label>
                                                </Col>
                                                <Col md={8}>
                                                    {isAdmin ? (
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            name="description"
                                                            value={formData.description}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter organization description"
                                                            className="bg-dark text-light border-secondary"
                                                        />
                                                    ) : (
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            readOnly
                                                            value={formData.description}
                                                            plaintext
                                                            className="bg-dark text-light border-0"
                                                        />
                                                    )}
                                                </Col>
                                            </Row>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="contactEmail">
                                            <Row className="align-items-center">
                                                <Col md={4}>
                                                    <Form.Label>Contact Email</Form.Label>
                                                </Col>
                                                <Col md={8}>
                                                    {isAdmin ? (
                                                        <Form.Control
                                                            type="email"
                                                            name="contactEmail"
                                                            value={formData.contactEmail}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter contact email"
                                                            className="bg-dark text-light border-secondary"
                                                        />
                                                    ) : (
                                                        <Form.Control
                                                            type="email"
                                                            readOnly
                                                            plaintext
                                                            value={formData.contactEmail}
                                                            className="bg-dark text-light border-0"
                                                        />
                                                    )}
                                                </Col>
                                            </Row>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="website">
                                            <Row className="align-items-center">
                                                <Col md={4}>
                                                    <Form.Label>Website</Form.Label>
                                                </Col>
                                                <Col md={8}>
                                                    {isAdmin ? (
                                                        <Form.Control
                                                            type="url"
                                                            name="website"
                                                            value={formData.website}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter website URL"
                                                            className="bg-dark text-light border-secondary"
                                                        />
                                                    ) : (
                                                        <Form.Control
                                                            type="url"
                                                            readOnly
                                                            plaintext
                                                            value={formData.website}
                                                            className="bg-dark text-light border-0"
                                                        />
                                                    )}
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className="text-end">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Logo Preview"
                                                className="img-fluid rounded"
                                                style={{ maxHeight: '150px' }}
                                            />
                                        ) : (
                                            <div className="p-3 bg-secondary text-center rounded">
                                                <icon.Image size={48} />
                                                <p className="mt-2">No logo available</p>
                                            </div>
                                        )}
                                        {isAdmin && (
                                            <Form.Control
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="mt-2 bg-dark text-light border-secondary"
                                            />
                                        )}
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-between mt-4">
                                    <Button
                                        variant="outline-light custom-create-button"
                                        onClick={() => navigate(-1)}
                                    >
                                        {isAdmin ? 'Cancel' : `Back to ${organizationId}`}
                                    </Button>

                                    {isAdmin && (
                                        <>
                                            <Button
                                                variant="secondary"
                                                type="submit"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            className="me-2"
                                                        />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    'Update Organization'
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Form>
                        )}
                    </div>
                </Container>
            </Col>
        </Row>
    );
};

export default OrganizationDetails;
