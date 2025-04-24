import React, { useState, useEffect, useRef, useContext } from 'react';
import { Button, Col, Row, Container, Alert } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';
import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import GalleryCard from '../../components/cards/galleryCard/GalleryCard';
import { Organization, getPublicOrganizations } from '../../context/OrgService';
import AuthContext from '../../context/AuthContext';

const Organizations: React.FC = () => {
    const { user, token } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const fetchedRef = useRef(false);

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
                        {/* Create Organization should only appear when a user is logged in */}
                        <NavButton
                            to="/organizations/create"
                            variant="outline-light"
                            className="mx-1 top-bar-element"
                        >
                            Create Organization
                        </NavButton>
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

    const fetchOrganizations = async (key: string | undefined = undefined) => {
        setLoading(true);
        try {
            const orgs = await getPublicOrganizations(key);
            if (key) {
                setOrganizations(prev => [...prev, ...orgs.data.organizations]);
            } else {
                setOrganizations(orgs.data.organizations);
            }
            setLastEvaluatedKey(orgs.lastEvaluatedKey); // update for next fetch
            setHasMore(orgs.lastEvaluatedKey !== null); // if there's no more key, no more data
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch organizations');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchOrganizations();

        // Set up a timer to refresh organizations every 45 minutes to get fresh presigned URLs
        // This is less than the typical 1-hour expiration time for presigned URLs
        const refreshInterval = setInterval(
            () => {
                console.log('Refreshing organization data to update presigned URLs');
                fetchOrganizations();
            },
            45 * 60 * 1000
        ); // 45 minutes in milliseconds

        // Cleanup the interval when component unmounts
        return () => clearInterval(refreshInterval);
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOrganizations(organizations);
        } else {
            const filtered = organizations.filter(org => {
                const nameMatch = org.name.toLowerCase().includes(searchTerm.toLowerCase());
                const descMatch =
                    org.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
                return nameMatch || descMatch;
            });
            setFilteredOrganizations(filtered);
        }
    }, [organizations, searchTerm]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchOrganizations(lastEvaluatedKey ?? undefined);
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
                                searchComponent={searchComponent}
                                rightComponents={rightComponents}
                            />
                        </Row>
                    </div>
                    <div className="p-3 bg-dark text-white">
                        <Container fluid>
                            <Row>
                                <Col>
                                    <h1 className="mb-4">Organizations</h1>
                                </Col>
                            </Row>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Row>
                                {loading && organizations.length === 0 ? (
                                    <div className="text-center p-5">Loading organizations...</div>
                                ) : filteredOrganizations.length === 0 ? (
                                    <div className="text-center p-5">
                                        {searchTerm
                                            ? 'No matching organizations found.'
                                            : 'No organizations available.'}
                                        {user && token && (
                                            <div className="mt-4">
                                                <Button
                                                    variant="primary"
                                                    as={NavLink as any}
                                                    to="/organizations/create"
                                                >
                                                    Create Your First Organization
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="d-flex flex-wrap gap-4">
                                        {filteredOrganizations.map(org => (
                                            <div key={org.id}>
                                                <GalleryCard
                                                    item={org}
                                                    className="organization-card"
                                                    orgName={org.name}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Row>
                            {hasMore && organizations.length > 0 && (
                                <Row className="mt-4">
                                    <Col className="text-center">
                                        <Button
                                            onClick={handleLoadMore}
                                            disabled={loading}
                                            variant="primary"
                                        >
                                            {loading ? 'Loading...' : 'Load More'}
                                        </Button>
                                    </Col>
                                </Row>
                            )}
                        </Container>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default Organizations;
