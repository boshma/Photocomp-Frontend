import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import * as icon from 'react-bootstrap-icons';
import { NavLink, useParams } from 'react-router-dom';
import logo from '../../../assets/PhotoCompLogo.png';

const Sidebar: React.FC = () => {
    const { id, eid } = useParams();
    return (
        <Navbar
            collapseOnSelect
            data-bs-theme="dark"
            bg="dark"
            variant="dark"
            className="flex-column sidebar"
        >
            <Navbar.Brand className="mx-auto sidebar-brand">
                <img src={logo} alt="Logo" />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="flex-column">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 sidebar-link ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        <icon.HouseDoor /> Home
                    </NavLink>

                    <NavLink
                        to="/organizations"
                        end
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 sidebar-link ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        <icon.Grid3x3Gap /> Organizations
                    </NavLink>

                    <NavLink
                        to="/events"
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 sidebar-link ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        <icon.Window /> Events
                    </NavLink>

                    <NavLink
                        to={`/organizations/${id || `:id`}/events/${eid || `:eid`}/photos`}
                        end
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center gap-2 sidebar-link ${
                                isActive ? 'active' : ''
                            }`
                        }
                    >
                        <icon.Images /> Photos
                    </NavLink>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Sidebar;
