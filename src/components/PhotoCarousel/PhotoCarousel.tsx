import React, { useState, useEffect, useContext } from 'react';
import {
    Carousel,
    Button,
    Spinner,
    OverlayTrigger,
    Tooltip,
    Container,
    Row,
    Col,
} from 'react-bootstrap';
import { ChevronLeft, ChevronRight, TagFill } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Photo, getAllPhotos } from '../../context/PhotoService';
import AuthContext from '../../context/AuthContext';
import { getPhotoTags, TaggedUserWithDetails } from '../../context/PhotoTagService';
import { isMemberOfOrg } from '../../context/AuthService';

interface CustomPhotoCarouselProps {
    orgName: string;
    eventId: string;
    activeIndex: number;
    preferredSize?: 'small' | 'medium' | 'large';
    onIndexChange: (index: number) => void;
}

const CustomPhotoCarousel: React.FC<CustomPhotoCarouselProps> = ({
    orgName,
    eventId,
    activeIndex,
    preferredSize = 'medium',
    onIndexChange,
}) => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [taggedUsers, setTaggedUsers] = useState<Map<string, TaggedUserWithDetails[]>>(new Map());
    const [loadingTags, setLoadingTags] = useState<boolean>(false);
    const [userOrgRole, setUserOrgRole] = useState<string | null>(null);
    const [checkingRole, setCheckingRole] = useState<boolean>(true);

    // Check if user is admin of this organization
    useEffect(() => {
        const checkUserRole = async () => {
            if (user) {
                try {
                    setCheckingRole(true);
                    const response = await isMemberOfOrg(user.id, orgName);
                    if (
                        response &&
                        response.data &&
                        response.data.data &&
                        response.data.data.membership
                    ) {
                        setUserOrgRole(response.data.data.membership.role);
                    }
                } catch (err) {
                    console.error('Error checking user role:', err);
                    setUserOrgRole(null);
                } finally {
                    setCheckingRole(false);
                }
            } else {
                setCheckingRole(false);
            }
        };

        checkUserRole();
    }, [user, orgName]);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                setLoading(true);
                const response = await getAllPhotos(orgName, eventId);

                if (response.data.photos && response.data.photos.length > 0) {
                    setPhotos(response.data.photos);
                } else {
                    setError('No photos found for this event');
                }
            } catch (err) {
                console.error('Error fetching photos:', err);
                setError('Failed to load photos');
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [orgName, eventId]);

    // Fetch tags for the current photo when activeIndex changes
    useEffect(() => {
        const fetchPhotoTags = async () => {
            if (photos.length > 0 && activeIndex >= 0 && activeIndex < photos.length) {
                const currentPhoto = photos[activeIndex];

                // Check if we already fetched tags for this photo
                if (!taggedUsers.has(currentPhoto.id)) {
                    try {
                        setLoadingTags(true);
                        const response = await getPhotoTags(orgName, eventId, currentPhoto.id);

                        if (response && response.data && response.data.tags) {
                            setTaggedUsers(prev =>
                                new Map(prev).set(currentPhoto.id, response.data.tags)
                            );
                        }
                    } catch (err) {
                        console.error('Error fetching photo tags:', err);
                    } finally {
                        setLoadingTags(false);
                    }
                }
            }
        };

        fetchPhotoTags();
    }, [photos, activeIndex, orgName, eventId, taggedUsers]);

    const handleSelect = (selectedIndex: number) => {
        onIndexChange(selectedIndex);
    };

    // Navigate to the tag people page
    const handleTagPeople = () => {
        if (photos.length > 0 && activeIndex >= 0 && activeIndex < photos.length) {
            const currentPhoto = photos[activeIndex];
            navigate(`/organizations/${orgName}/events/${eventId}/photos/${currentPhoto.id}/tag`);
        }
    };

    // Calculate size based on preference
    const getCarouselSize = () => {
        switch (preferredSize) {
            case 'small':
                return { width: '100%', maxHeight: '400px', height: 'auto' };
            case 'large':
                return { width: '100%', maxHeight: '75vh', height: 'auto' };
            case 'medium':
            default:
                return { width: '100%', maxHeight: '600px', height: 'auto' };
        }
    };

    // Get the appropriate image URL based on available sizes - MODIFIED to cap at medium size
    const getImageUrl = (photo: Photo) => {
        // Check if photo has urls object with different sizes
        if (photo.urls) {
            // Always prioritize medium size if available
            if (photo.urls.medium) {
                return photo.urls.medium;
            }

            // If no medium size is available, use thumbnail as next option
            if (photo.urls.thumbnail) {
                return photo.urls.thumbnail;
            }

            // Only if neither medium nor thumbnail is available, fall back to original
            if (photo.urls.original) {
                return photo.urls.original;
            }
        }

        // If no urls object or no sizes in it, use the main url
        return photo.url;
    };

    // Custom carousel controls with white square backgrounds and rounded edges
    const customPrevIcon = (
        <div className="carousel-nav-button carousel-nav-prev">
            <ChevronLeft color="dark" size={36} />
        </div>
    );

    const customNextIcon = (
        <div className="carousel-nav-button carousel-nav-next">
            <ChevronRight color="dark" size={36} />
        </div>
    );

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: '400px' }}
            >
                <Spinner animation="border" variant="light" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-white p-5">
                <p>{error}</p>
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="text-center text-white p-5">
                <p>No photos available for this event</p>
            </div>
        );
    }

    // Get current photo and its tags
    const currentPhoto = photos[activeIndex];
    const currentPhotoTags = taggedUsers.get(currentPhoto.id) || [];

    // Only show tag button to admin users of this organization
    const showTagButton = !checkingRole && userOrgRole === 'ADMIN';

    return (
        <div className="photo-carousel-container">
            <style>
                {`
          .carousel-nav-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            opacity: 0.9;
            transition: opacity 0.2s ease;
            z-index: 1000;
          }
          
          .carousel-nav-button:hover {
            opacity: 1;
            cursor: pointer;
          }
          
          .carousel-nav-prev {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
          }
          
          .carousel-nav-next {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
          }
          
          .carousel-control-prev,
          .carousel-control-next {
            opacity: 1;
            width: 10%;
          }
          
          .carousel-control-prev-icon,
          .carousel-control-next-icon {
            display: none;
          }
          
          /* Add some vertical padding to the carousel container */
          .photo-carousel-container {
            padding-top: 20px;
            padding-bottom: 20px;
            position: relative;
          }
          
          /* Center the carousel in the available space */
          .carousel {
            margin: 0 auto;
          }

          /* Style for the caption container */
          .photo-caption-container {
            margin-top: 20px;
            text-align: center;
            padding: 15px;
            position: relative;
          }
          
          /* Style for tagged users */
          .tagged-users-container {
            margin-top: 10px;
            text-align: center;
          }
          
          .tagged-user-pill {
            display: inline-block;
            padding: 4px 10px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 20px;
            margin: 4px;
            font-size: 14px;
          }
          
          /* Tag button styling for inline with caption */
          .tag-button-inline {
            margin-left: 12px;
            padding: 3px 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(220, 53, 69, 0.7);
            border: none;
            border-radius: 4px;
            color: white;
            transition: all 0.2s ease;
          }
          
          .tag-button-inline:hover {
            background-color: rgba(220, 53, 69, 0.9);
          }
          
          .tag-button-icon {
            margin-right: 4px;
          }
          
          .image-container {
            position: relative;
          }
          
          .caption-row {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
          }
        `}
            </style>

            <Carousel
                activeIndex={activeIndex}
                onSelect={handleSelect}
                interval={null}
                indicators={false}
                prevIcon={customPrevIcon}
                nextIcon={customNextIcon}
                className="bg-dark position-relative"
            >
                {photos.map((photo, index) => (
                    <Carousel.Item key={photo.id}>
                        {/* Image container with relative positioning */}
                        <div
                            className="d-flex justify-content-center align-items-center"
                            style={getCarouselSize()}
                        >
                            <img
                                src={getImageUrl(photo)}
                                alt={photo.metadata?.title || `Photo ${index + 1}`}
                                style={{
                                    maxHeight: '100%',
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>

            {/* Caption container outside the carousel */}
            {photos.length > 0 && activeIndex < photos.length && (
                <div className="photo-caption-container text-white">
                    <div className="caption-row">
                        <span className="fw-bold">
                            {currentPhoto.metadata?.title || `Photo ${activeIndex + 1}`}
                        </span>

                        {currentPhoto.metadata?.description && (
                            <>
                                <span className="mx-2">-</span>
                                <span>{currentPhoto.metadata.description}</span>
                            </>
                        )}

                        {/* Tag button inline with caption */}
                        {showTagButton && (
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id="tag-tooltip">Tag people in this photo</Tooltip>
                                }
                            >
                                <Button
                                    className="tag-button-inline ms-3"
                                    onClick={handleTagPeople}
                                    aria-label="Tag people in this photo"
                                    size="sm"
                                >
                                    <TagFill size={16} className="tag-button-icon" />
                                    Tag People
                                </Button>
                            </OverlayTrigger>
                        )}
                    </div>

                    {/* Show tagged users */}
                    {loadingTags ? (
                        <div className="d-flex justify-content-center mt-2">
                            <Spinner animation="border" variant="light" size="sm" />
                        </div>
                    ) : currentPhotoTags.length > 0 ? (
                        <div className="tagged-users-container mt-2">
                            <small className="d-block mb-1">People in this photo:</small>
                            {currentPhotoTags.map(taggedUser => (
                                <span key={taggedUser.tag.id} className="tagged-user-pill">
                                    {taggedUser.user.firstName} {taggedUser.user.lastName}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default CustomPhotoCarousel;
