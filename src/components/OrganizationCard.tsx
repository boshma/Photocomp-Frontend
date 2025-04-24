import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

interface OrgCardProps {
    index: number;
}

const OrganizationCard: React.FC<OrgCardProps> = ({ index }) => {
    return (
        <Card className="mb-3">
            <Card.Img
                variant="top"
                src={`https://picsum.photos/200?random=${index}`}
                alt={`Random ${index}`}
            />
            <Card.Body>
                <Card.Title>Organization {index}</Card.Title>
                <Card.Text>
                    This is a short description of the organization. More details can be added here.
                </Card.Text>
                <Button variant="primary">Learn More</Button>
            </Card.Body>
        </Card>
    );
};

export default OrganizationCard;
