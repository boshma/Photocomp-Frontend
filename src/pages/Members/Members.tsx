import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Col, Row, Container, Alert } from 'react-bootstrap';
import AuthContext from '../../context/AuthContext';
import * as icon from 'react-bootstrap-icons';

import NavButton from '../../components/navButton/NavButton';
import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import MemberRow from '../../components/memberRow/MemberRow';
import { Member } from '../../components/cards/memberCard/MemberCard';
import {
    getOrganizationMembers,
    updateMember,
    removeMember,
    Role,
} from '../../context/MemberService';

const Members: React.FC = () => {
    const { user, token } = useContext(AuthContext);
    const { orgId } = useParams<{ orgId: string }>();

    const [searchTerm, setSearchTerm] = useState('');

    const [members, setMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const [processingAction, setProcessingAction] = useState<boolean>(false); // Setting a quasi mutex

    useEffect(() => {
        if (!orgId) return;

        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getOrganizationMembers(orgId);
                setMembers(response.data.members);
                setFilteredMembers(response.data.members);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching organization members:', err);
                setError('Failed to load organization members. Please try again later.');
                setLoading(false);
            }
        };

        fetchMembers();
    }, [orgId]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredMembers(members);
        } else {
            const filtered = members.filter(member => {
                const { firstName, lastName, email } = member.userDetails;
                const fullName = `${firstName} ${lastName}`.toLowerCase();
                const username = email.split('@')[0].toLowerCase();
                const emailLower = email.toLowerCase();
                const search = searchTerm.toLowerCase();

                return (
                    fullName.includes(search) ||
                    username.includes(search) ||
                    emailLower.includes(search)
                );
            });
            setFilteredMembers(filtered);
        }
    }, [members, searchTerm]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    const adminMembers = filteredMembers.filter(member => member.role === 'ADMIN');
    const regularMembers = filteredMembers.filter(member => member.role === 'MEMBER');

    const handleUpdateMember = async (actionType: string, memberId: string) => {
        if (!orgId) return;

        try {
            setProcessingAction(true);
            setError(null);
            const organizationId = orgId.toLowerCase();

            if (actionType === 'promote') {
                await updateMember(organizationId, memberId, Role.Admin);
                setActionSuccess('Member successfully promoted to admin.');

                setMembers(prevMembers =>
                    prevMembers.map(member => {
                        if (member.userId === memberId) {
                            return { ...member, role: Role.Admin };
                        }
                        return member;
                    })
                );
            } else if (actionType === 'demote') {
                await updateMember(organizationId, memberId, Role.Member);
                setActionSuccess('Admin successfully demoted to member.');

                setMembers(prevMembers =>
                    prevMembers.map(member => {
                        if (member.userId === memberId) {
                            return { ...member, role: Role.Member };
                        }
                        return member;
                    })
                );
            } else if (actionType === 'remove') {
                await removeMember(organizationId, memberId);
                setActionSuccess('Member successfully removed from organization.');
                setMembers(prevMembers => prevMembers.filter(member => member.userId !== memberId));
            }

            setProcessingAction(false);
        } catch (err) {
            console.error(`Error performing action ${actionType} on member ${memberId}:`, err);
            setError(`Failed to ${actionType} member. Please try again.`);
            setProcessingAction(false);
        }
    };

    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search members..."
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
                                Members: {orgId && orgId.charAt(0).toUpperCase() + orgId.slice(1)}
                            </h1>
                            <NavButton
                                className="requests-button"
                                to={`/organizations/${orgId}/members/requests`}
                            >
                                {' '}
                                Go to Requests{' '}
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
                                Loading organization members...
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="text-center p-5 text-white">
                                {searchTerm
                                    ? 'No matching members found.'
                                    : 'No members in this organization.'}
                            </div>
                        ) : (
                            <>
                                {/* Admin Members Row */}
                                {adminMembers.length > 0 && (
                                    <MemberRow
                                        title="Admin Members"
                                        members={adminMembers}
                                        onAction={handleUpdateMember}
                                        actionTypes={['demote']}
                                        actionLabels={['Demote to Member']}
                                    />
                                )}

                                {/* Regular Members Row */}
                                {regularMembers.length > 0 && (
                                    <MemberRow
                                        title="Members"
                                        members={regularMembers}
                                        onAction={handleUpdateMember}
                                        actionTypes={['remove', 'promote']}
                                        actionLabels={['Remove Member', 'Promote to Admin']}
                                    />
                                )}
                            </>
                        )}
                    </Container>
                </Col>
            </Row>
        </>
    );
};

export default Members;
