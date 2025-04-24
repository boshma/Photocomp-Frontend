import React from 'react';
import { Navbar, Container, Row, Col } from 'react-bootstrap';

interface TopBarProps {
    searchComponent?: React.ReactNode;
    rightComponents?: React.ReactNode;
    className?: string;
    bg?: string;
    variant?: string;
}

const TopBar: React.FC<TopBarProps> = ({
    searchComponent,
    rightComponents,
    className = '',
    bg = 'dark',
    variant = 'dark',
}) => {
    return (
        <Navbar
            bg={bg}
            variant={variant}
            className={`py-2 top-navbar position-sticky ${className}`}
            data-bs-theme={variant}
            expand="lg"
            style={{ top: 0, zIndex: 999 }}
        >
            <Container fluid>
                <Row className="w-100 align-items-center">
                    <Col xs={12} md={9} className="px-0">
                        {searchComponent}
                    </Col>
                    <Col xs={12} md={3} className="px-0 d-flex justify-content-end">
                        {rightComponents}
                    </Col>
                </Row>
            </Container>
        </Navbar>
    );
};

export default TopBar;
