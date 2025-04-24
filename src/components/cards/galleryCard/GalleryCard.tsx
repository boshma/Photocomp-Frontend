import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Organization {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    PK?: string;
}

interface Event {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    date?: string;
    GSI2PK?: string;
    organizationName?: string;
}

interface Photo {
    id: string;
    url: string;
    urls?: {
        original?: string;
        thumbnail?: string;
        medium?: string;
        large?: string;
    };
    title?: string;
    GSI2PK?: string;
}

type CardItem = Organization | Event | Photo;

interface GalleryCardProps {
    item: CardItem;
    className: string;
    orgName: string | undefined;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item, className, orgName }) => {
    const navigate = useNavigate();
    const isOrganization = className.includes('organization');
    const isEvent = className.includes('event');
    const isPhoto = className.includes('photo');

    // Add state for fallback image
    const [imageError, setImageError] = useState(false);
    const fallbackImage = '/placeholder-image.jpg'; // Default placeholder image

    // Function to check if item is an Organization
    const isOrganizationItem = (item: CardItem): item is Organization =>
        'name' in item && !('title' in item && !('organizationName' in item));

    // Function to check if item is an Event
    const isEventItem = (item: CardItem): item is Event => 'title' in item;

    // Function to check if item is a Photo
    const isPhotoItem = (item: CardItem): item is Photo => 'url' in item;

    // Handler for image load errors
    const handleImageError = () => {
        setImageError(true);
    };

    const getBackgroundImage = () => {
        // If we already had an error loading the image, use fallback
        if (imageError) {
            return fallbackImage;
        }

        if (isOrganizationItem(item) && item.logoUrl) {
            return item.logoUrl;
        } else if (isEventItem(item) && item.imageUrl) {
            return item.imageUrl;
        } else if (isPhotoItem(item)) {
            // Use medium size if available, otherwise fall back to other sizes
            if (item.urls) {
                if (item.urls.medium) {
                    return item.urls.medium;
                }
                if (item.urls.large) {
                    return item.urls.large;
                }
                if (item.urls.original) {
                    return item.urls.original;
                }
                if (item.urls.thumbnail) {
                    return item.urls.thumbnail;
                }
            }
            return item.url;
        }
        return fallbackImage;
    };

    const getTitle = () => {
        if (isOrganizationItem(item)) {
            return item.name;
        } else if (isEventItem(item)) {
            return item.title;
        } else if (isPhotoItem(item) && item.title) {
            return item.title;
        }
        return '';
    };

    const getDescription = () => {
        let description = '';
        if (isOrganizationItem(item) && item.description) {
            description = item.description;
        } else if (isEventItem(item) && item.description) {
            description = item.description;
        }
        if (description.length > 100) {
            return description.substring(0, 97) + '...';
        }
        return description;
    };

    const getOrganizationName = () => {
        if (isEventItem(item)) {
            if (item.organizationName) {
                return item.organizationName;
            } else if (item.GSI2PK) {
                const match = item.GSI2PK.match(/^ORG#(.+)$/);
                return match ? match[1] : '';
            }
        }
        return '';
    };

    const handleCardClick = (orgName: string | undefined) => {
        return () => {
            if (orgName) {
                if (isOrganizationItem(item)) {
                    navigate(`/organizations/${orgName.toLowerCase()}/events`);
                } else if (isEventItem(item)) {
                    navigate(
                        `/organizations/${orgName.toLowerCase().slice(4)}/events/${item.id}/photos`
                    );
                } else if (isPhotoItem(item)) {
                    // Extract the event ID from GSI2PK (format is EVENT#eventId)
                    const eventId = item.GSI2PK ? item.GSI2PK.replace('EVENT#', '') : '';
                    // Navigate to the photo carousel view for this specific photo
                    const orgNameProcessed = orgName.toLowerCase();
                    navigate(
                        `/organizations/${orgNameProcessed}/events/${eventId}/photos/${item.id}`
                    );
                }
            }
        };
    };

    // Use preloaded image to detect load failures
    useEffect(() => {
        const img = new Image();
        img.src = getBackgroundImage();
        img.onload = () => setImageError(false);
        img.onerror = () => setImageError(true);
    }, [item]); // Re-run when item changes

    return (
        <Card
            className={`gallery-card ${className} ${imageError ? 'image-error' : ''}`}
            onClick={handleCardClick(orgName)}
            style={{
                width: '350px',
                height: '250px',
                backgroundImage: `url(${getBackgroundImage()})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                cursor: 'pointer',
            }}
            onError={handleImageError}
        >
            {/* Only apply overlay to non-photo cards */}
            {!isPhoto && <div className="card-overlay"></div>}
            {isEvent && <div className="organization-badge">{getOrganizationName()}</div>}
            {!isPhoto && (
                <div className="card-content">
                    <h5 className="card-title">{getTitle()}</h5>
                    {getDescription() && <p className="card-description">{getDescription()}</p>}
                </div>
            )}
        </Card>
    );
};

export default GalleryCard;
