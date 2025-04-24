import React, { useState } from 'react';
import { Col, Row, Container } from 'react-bootstrap';
import { BellFill, PersonCircle } from 'react-bootstrap-icons';

import Sidebar from '../components/bars/SideBar/SideBar';
import TopBar from '../components/bars/TopBar/TopBar';
import SearchBar from '../components/bars/SearchBar/SearchBar';
import NavButton from '../components/navButton/NavButton';
import Gallery from '../components/Gallery';

const items = [
    {
        id: 'NAME',
        name: 'name',
        description: 'Some random description',
        logoUrl: 'https://picsum.photos/300/200',
        PK: 'ORG#NAME',
    },
    {
        id: 'NAME',
        name: 'name',
        description: 'Some random description',
        logoUrl: 'https://picsum.photos/300/200',
        PK: 'ORG#NAME',
    },
    {
        id: 'NAME',
        name: 'name',
        description: 'Some random description',
        logoUrl: 'https://picsum.photos/300/200',
        PK: 'ORG#NAME',
    },
    {
        id: 'NAME',
        name: 'name',
        description: 'Some random description',
        logoUrl: 'https://picsum.photos/300/200',
        PK: 'ORG#NAME',
    },
    {
        id: 'NAME',
        name: 'name',
        description: 'Some random description',
        logoUrl: 'https://picsum.photos/300/200',
        PK: 'ORG#NAME',
    },
    {
        id: 'NAME',
        name: 'name',
        description: 'Some random description',
        logoUrl: 'https://picsum.photos/300/200',
        PK: 'ORG#NAME',
    },
    {
        id: 'NAME',
        name: 'name',
        description: 'Some random description',
        logoUrl: 'https://picsum.photos/300/200',
        PK: 'ORG#NAME',
    },
    {
        id: 'NAME',
        name: 'name',
        description: 'Some random description',
        logoUrl: 'https://picsum.photos/300/200',
        PK: 'ORG#NAME',
    },
    {
        id: 'NAME',
        name: 'name',
        description: 'Some random description',
        logoUrl: 'https://picsum.photos/300/200',
        PK: 'ORG#NAME',
    },
];

const Organizations = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Search submitted:', searchTerm);
        // searching
    };

    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search organizations..."
        />
    );

    const rightComponents = (
        <>
            <NavButton to="/register" variant="outline-light" className="mx-2 top-bar-element">
                Register
            </NavButton>
            <NavButton to="/login" variant="outline-light" className="top-bar-element">
                Login
            </NavButton>
            <BellFill className="text-light m-2 top-bar-element" size={24} />
            <PersonCircle className="text-light m-2 top-bar-element" size={24} />
        </>
    );

    return (
        <>
            <Row className="g-0">
                <Col md="auto">
                    <Sidebar />
                </Col>
                <Col>
                    <TopBar searchComponent={searchComponent} rightComponents={rightComponents} />

                    <Container fluid className="px-4 py-3">
                        <h1 className="mb-4">Organizations</h1>
                        <Gallery items={items} useNewCard={true} />
                    </Container>
                </Col>
            </Row>
        </>
    );
};

export default Organizations;
