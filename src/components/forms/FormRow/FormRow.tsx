import React from 'react';
import { Row, Col } from 'react-bootstrap';

interface FormRowProps {
    children: React.ReactNode;
}

const FormRow: React.FC<FormRowProps> = ({ children }) => {
    return (
        <Row className="form-row mb-2 w-100 mx-0">
            {React.Children.map(children, (child, index) => (
                <Col className="px-0" key={index}>
                    {child}
                </Col>
            ))}
        </Row>
    );
};

export default FormRow;
