import React, { useState, useEffect, useContext } from 'react';
import { Button, Col, Row, Modal, Alert, Form } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { NavLink, useParams, useNavigate } from 'react-router-dom';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import GalleryCard from '../../components/cards/galleryCard/GalleryCard';
import { isMemberOfOrg } from '../../context/AuthService';
import {
    Event,
    getPublicOrganizationEvents,
    getOrganizationEvents,
} from '../../context/OrgService';
import AuthContext from '../../context/AuthContext';
import {
    getOrganizationMembershipRequests,
    sendJoinRequest,
} from '../../context/MembershipService';

const SingleEvents: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user, token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');

    const [requested, setRequested] = useState<boolean>(false);
    const [memberRole, setMemberRole] = useState<string | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [joinLoading, setJoinLoading] = useState<boolean>(false);
    const [joinSuccess, setJoinSuccess] = useState<boolean>(false);
    const [joinError, setJoinError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchEvents = async () => {
            let response;
            try {
                setLoading(true);
                setError(null);

                if (!user || !token) {
                    response = await getPublicOrganizationEvents(id);
                } else {
                    try {
                        try {
                            const reply = await isMemberOfOrg(user.id, id);
                            const userRelationRecord = reply.data.data;
                            setMemberRole(userRelationRecord.membership.role);
                            response = await getOrganizationEvents(id);
                        } catch (e: any) {
                            console.log(e);
                            const reply = await getOrganizationMembershipRequests(id);
                            const orgRequests = reply.data.requests;
                            setRequested(orgRequests.some(req => req.userId == user.id));
                            response = await getPublicOrganizationEvents(id);
                        }
                    } catch (_: any) {
                        console.log(_);
                    }
                }
                if (!response) throw Error('No response');

                setEvents(response.data.events);
                setFilteredEvents(response.data.events);
                setLastEvaluatedKey(response.lastEvaluatedKey);
                setHasMore(response.lastEvaluatedKey !== null);
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching events for organization ${id}:`, err);
                setError(`Failed to load events for this organization. Please try again later.`);
                setLoading(false);
            }
        };

        fetchEvents();
    }, [id, user, token]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredEvents(events);
        } else {
            const filtered = events.filter(event => {
                const titleMatch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
                const descMatch =
                    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
                return titleMatch || descMatch;
            });
            setFilteredEvents(filtered);
        }
    }, [events, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const handleLoadMore = async () => {
        if (loading || !hasMore || !id) return;

        try {
            setLoading(true);
            const response = await getPublicOrganizationEvents(id, lastEvaluatedKey ?? undefined);
            const existingEventIds = new Map(events.map(event => [event.id, true]));

            const newEvents = response.data.events.filter(event => !existingEventIds.has(event.id));

            if (newEvents.length > 0) {
                setEvents(prev => [...prev, ...newEvents]);
            }

            setLastEvaluatedKey(response.lastEvaluatedKey);
            setHasMore(response.lastEvaluatedKey !== null);
            setLoading(false);
        } catch (err) {
            console.error(`Error loading more events for organization ${id}:`, err);
            setError('Failed to load more events. Please try again.');
            setLoading(false);
        }
    };

    const handleShowJoinModal = () => {
        setShowJoinModal(true);
        setJoinError(null);
    };

    const handleCloseJoinModal = () => {
        setShowJoinModal(false);
        setJoinError(null);
        setMessage('');
    };

    const handleJoinSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!id || !user) return;

        try {
            setJoinLoading(true);
            await sendJoinRequest(id, message);
            setJoinSuccess(true);
            setJoinLoading(false);
            setRequested(true);
        } catch (error) {
            console.log(error);
            setJoinLoading(false);
            setJoinError('Failed to send the join request');
            setJoinSuccess(false);
            setRequested(false);
        }
    };

    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search events..."
            className="ms-3"
        />
    );

    const rightComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {user && token ? (
                    <>
                        {/* Create Event should only appear when an admin user is logged in */}
                        {memberRole == 'ADMIN' && (
                            <NavButton
                                to={`/organizations/${id}/events/create`}
                                variant="outline-light"
                                className="mx-1 top-bar-element"
                            >
                                Create Event
                            </NavButton>
                        )}

                        {user && !memberRole && !requested && (
                            <Button
                                variant="outline-light"
                                className="mx-1 top-bar-element custom-create-button"
                                onClick={handleShowJoinModal}
                            >
                                Join the Org !
                            </Button>
                        )}

                        {requested && <p className="ml-2 mt-2 text-info"> Request Pending! </p>}

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

    const pageActionComponents = (
        <>
            <div className="d-flex align-items-center gap-3">
                {user && token ? (
                    <>
                        {/* Only show Members link if user is a member or admin */}
                        {memberRole === 'ADMIN' && (
                            <NavLink
                                to={`/organizations/${id}/members`}
                                className="text-light top-bar-element"
                            >
                                <icon.PersonLinesFill size={24} />
                            </NavLink>
                        )}
                        <NavLink
                            to={`/organizations/${id}/details`}
                            className="text-light top-bar-element"
                        >
                            <icon.ListUl size={24} />
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink
                            to={`/organizations/${id}/details`}
                            className="text-light top-bar-element"
                        >
                            <icon.ListUl size={24} />
                        </NavLink>
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
                    <div className="sticky-top bg-dark z-3">
                        <Row>
                            <TopBar
                                searchComponent={searchComponent}
                                rightComponents={rightComponents}
                            />
                        </Row>
                    </div>
                    <div className="p-3 bg-dark text-white">
                        <Row className="align-items-center mb-4">
                            <Col>
                                <h1 className="mb-4">
                                    Events: {id && id.charAt(0).toUpperCase() + id.slice(1)}
                                </h1>
                            </Col>
                            <Col>
                                <p className="mb-4">
                                    Role: {`${memberRole ? memberRole : user ? 'User' : 'Guest'}`}
                                </p>
                            </Col>

                            <Col xs="auto" className="ms-auto me-5">
                                {pageActionComponents}
                            </Col>
                        </Row>
                        <Row>
                            {error && <div className="alert alert-danger">{error}</div>}

                            {showJoinModal && (
                                <Modal show={showJoinModal} onHide={handleCloseJoinModal} centered>
                                    <Modal.Header closeButton className="bg-dark text-white">
                                        <Modal.Title>Join Organization</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body className="bg-dark text-white">
                                        {joinSuccess ? (
                                            <Alert variant="success">
                                                Your request to join the organization has been sent
                                                successfully!
                                            </Alert>
                                        ) : (
                                            <Form onSubmit={handleJoinSubmit}>
                                                {joinError && (
                                                    <Alert variant="danger">{joinError}</Alert>
                                                )}
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Message (Optional)</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        placeholder="Tell the organization why you'd like to join..."
                                                        value={message}
                                                        onChange={e => setMessage(e.target.value)}
                                                        className="bg-secondary text-white"
                                                    />
                                                </Form.Group>
                                                <div className="d-flex justify-content-end">
                                                    <Button
                                                        variant="primary"
                                                        type="submit"
                                                        disabled={joinLoading}
                                                    >
                                                        {joinLoading
                                                            ? 'Sending...'
                                                            : 'Submit Request'}
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={handleCloseJoinModal}
                                                        className="me-2"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </Form>
                                        )}
                                    </Modal.Body>
                                </Modal>
                            )}

                            {loading && events.length === 0 ? (
                                <div className="text-center p-5">Loading events...</div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="text-center p-5">
                                    {searchTerm
                                        ? 'No matching events found.'
                                        : 'No events for this organization.'}

                                    {user && token && memberRole === 'ADMIN' && (
                                        <div className="mt-4">
                                            <Button
                                                variant="primary"
                                                onClick={() =>
                                                    navigate(`/organizations/${id}/events/create`)
                                                }
                                            >
                                                Create Your First Event
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="d-flex flex-wrap gap-4">
                                    {filteredEvents.map(event => (
                                        <div key={event.id}>
                                            <GalleryCard
                                                item={event}
                                                className="event"
                                                orgName={event.GSI2PK}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {hasMore && filteredEvents.length > 0 && !searchTerm && (
                                <div className="text-center mt-4 mb-4">
                                    <Button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        variant="primary"
                                    >
                                        {loading ? 'Loading...' : 'Load More'}
                                    </Button>
                                </div>
                            )}
                        </Row>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default SingleEvents;
