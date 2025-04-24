import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

interface FormContainerProps {
    children: React.ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
    return (
        <Container
            fluid
            className="form-container d-flex align-items-center justify-content-center min-vh-100 p-0"
        >
            <Row className="justify-content-center">
                <Col xs={12} className="d-flex justify-content-center">
                    {children}
                </Col>
            </Row>
        </Container>
    );
};

export default FormContainer;
