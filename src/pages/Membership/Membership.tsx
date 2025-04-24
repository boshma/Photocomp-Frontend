import React, { useState, useEffect, useContext } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Col, Row, Container, Button, Alert } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import MembershipCard, {
    MembershipRequest,
} from '../../components/cards/membershipCard/MembershipCard';
import {
    getOrganizationMembershipRequests,
    acceptMembershipRequest,
    denyMembershipRequest,
} from '../../context/MembershipService';

const Membership: React.FC = () => {
    const { user, token } = useContext(AuthContext);
    const { orgId } = useParams<{ orgId: string }>();
    const [searchTerm, setSearchTerm] = useState('');
    const [requests, setRequests] = useState<MembershipRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<MembershipRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [processingRequest, setProcessingRequest] = useState<boolean>(false);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!orgId) return;

        const fetchRequests = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getOrganizationMembershipRequests(orgId);
                setRequests(response.data.requests);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching membership requests:', err);
                setError('Failed to load membership requests. Please try again later.');
                setLoading(false);
            }
        };

        fetchRequests();
    }, [orgId]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredRequests(requests);
        } else {
            const filtered = requests.filter(request => {
                const { firstName, lastName, email } = request.userDetails;
                const fullName = `${firstName} ${lastName}`.toLowerCase();
                const emailLower = email.toLowerCase();
                const search = searchTerm.toLowerCase();

                return (
                    fullName.includes(search) ||
                    emailLower.includes(search) ||
                    (request.message && request.message.toLowerCase().includes(search))
                );
            });
            setFilteredRequests(filtered);
        }
    }, [requests, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const handleSelectRequest = (requestId: string) => {
        setSelectedRequestId(requestId === selectedRequestId ? null : requestId);
        setActionSuccess(null);
    };

    const handleAcceptRequest = async () => {
        if (!selectedRequestId || !orgId) return;

        try {
            setProcessingRequest(true);
            const organizationId = orgId.toLowerCase();
            await acceptMembershipRequest(organizationId, selectedRequestId);

            setRequests(prevRequests =>
                prevRequests.filter(request => {
                    const requestUserId = request.SK.split('#')[1] || request.userId;
                    return requestUserId !== selectedRequestId;
                })
            );

            setSelectedRequestId(null);
            setActionSuccess('Membership request accepted successfully.');
            setProcessingRequest(false);
        } catch (err) {
            console.error('Error accepting request:', err);
            setError('Failed to accept membership request. Please try again.');
            setProcessingRequest(false);
        }
    };

    const handleDenyRequest = async () => {
        if (!selectedRequestId || !orgId) return;

        try {
            setProcessingRequest(true);
            const organizationId = orgId.toLowerCase();
            await denyMembershipRequest(organizationId, selectedRequestId);

            setRequests(prevRequests =>
                prevRequests.filter(request => {
                    const requestUserId = request.SK.split('#')[1] || request.userId;
                    return requestUserId !== selectedRequestId;
                })
            );

            setSelectedRequestId(null);
            setActionSuccess('Membership request denied successfully.');
            setProcessingRequest(false);
        } catch (err) {
            console.error('Error denying request:', err);
            setError('Failed to deny membership request. Please try again.');
            setProcessingRequest(false);
        }
    };

    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search membership requests..."
        />
    );

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

    return (
        <>
            <Row className="g-0">
                <Col md="auto" className="sidebar-container">
                    <Sidebar />
                </Col>
                <Col className="main-content p-0">
                    <TopBar searchComponent={searchComponent} rightComponents={rightComponents} />

                    <Container fluid className="px-4 py-3">
                        <div className="row-title">
                            <h1 className="mb-4 page-title">
                                Requests: {orgId && orgId.charAt(0).toUpperCase() + orgId.slice(1)}
                            </h1>
                            <NavButton
                                className="members-button"
                                to={`/organizations/${orgId}/members`}
                            >
                                {' '}
                                Go to Members{' '}
                            </NavButton>
                        </div>

                        {error && (
                            <Alert variant="danger" dismissible onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {actionSuccess && (
                            <Alert
                                variant="success"
                                dismissible
                                onClose={() => setActionSuccess(null)}
                            >
                                {actionSuccess}
                            </Alert>
                        )}

                        {loading ? (
                            <div className="text-center p-5 text-white">
                                Loading membership requests...
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center p-5 text-white">
                                {searchTerm
                                    ? 'No matching requests found.'
                                    : 'No pending membership requests.'}
                            </div>
                        ) : (
                            <>
                                <div className="d-flex flex-wrap gap-4 mb-4">
                                    {filteredRequests.map(request => (
                                        <MembershipCard
                                            key={request.userId}
                                            request={request}
                                            isSelected={selectedRequestId === request.userId}
                                            onSelect={handleSelectRequest}
                                        />
                                    ))}
                                </div>

                                {selectedRequestId && (
                                    <div className="action-buttons mt-3 d-flex gap-3">
                                        <Button
                                            variant="success"
                                            onClick={handleAcceptRequest}
                                            disabled={processingRequest}
                                        >
                                            {processingRequest ? 'Processing...' : 'Accept Request'}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={handleDenyRequest}
                                            disabled={processingRequest}
                                        >
                                            {processingRequest ? 'Processing...' : 'Deny Request'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Container>
                </Col>
            </Row>
        </>
    );
};

export default Membership;
