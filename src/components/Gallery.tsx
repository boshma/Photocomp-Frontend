import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import GalleryCard from './cards/galleryCard/GalleryCard';
import OrganizationCard from './OrganizationCard';

interface GalleryProps {
    items: any[];
    type?: 'organization' | 'event' | 'photo';
    useNewCard?: boolean;
}
const Gallery: React.FC<GalleryProps> = ({ items, type = 'organization', useNewCard = true }) => {
    return (
        <Container fluid className="py-4">
            <Row className="g-4">
                {items.map(item => (
                    <Col
                        key={item.id}
                        xs={12}
                        sm={6}
                        md={4}
                        lg={4}
                        className="d-flex justify-content-center"
                    >
                        {useNewCard ? (
                            <GalleryCard item={item} className={`${type}-card`} />
                        ) : (
                            <OrganizationCard index={item.id} />
                        )}
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Gallery;
