import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import * as icon from 'react-bootstrap-icons';

import Sidebar from '../../components/bars/SideBar/SideBar';
import TopBar from '../../components/bars/TopBar/TopBar';
import SearchBar from '../../components/bars/SearchBar/SearchBar';
import NavButton from '../../components/navButton/NavButton';
import { NavLink } from 'react-router-dom';

import { uploadEventPhoto } from '../../context/PhotoService';

interface PhotoData {
    title: string;
    description: string;
    photos: File[];
}

const UploadEventPhoto: React.FC = () => {
    const navigate = useNavigate();
    const { id, eid } = useParams();
    const { user, token } = useContext(AuthContext);
    const [photoData, setPhotoData] = useState<PhotoData>({
        title: '',
        description: '',
        photos: [],
    });
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhotoData({
            ...photoData,
            title: e.target.value,
        });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhotoData({
            ...photoData,
            description: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const validFiles: File[] = [];
            const newPreviewUrls: string[] = [];
            let errorMessage = null;

            // Validate each file
            files.forEach(file => {
                // Check file type
                if (!file.type.match('image.*')) {
                    errorMessage = `File "${file.name}" is not an image file`;
                    return;
                }

                // Check file size (e.g., limit to 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    errorMessage = `File "${file.name}" exceeds 5MB size limit`;
                    return;
                }

                validFiles.push(file);

                // Create preview URL
                const reader = new FileReader();
                reader.onload = () => {
                    newPreviewUrls.push(reader.result as string);
                    // Update preview URLs if all files have been processed
                    if (newPreviewUrls.length === validFiles.length) {
                        setPreviewUrls(newPreviewUrls);
                    }
                };
                reader.readAsDataURL(file);
            });

            if (errorMessage) {
                setError(errorMessage);
                return;
            }

            setPhotoData({
                ...photoData,
                photos: validFiles,
            });

            setError(null);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Search submitted:', searchTerm);
        // Implement search logic
    };

    /* Components to be injected into the TopBar*/
    const searchComponent = (
        <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
            placeholder="Search photos..."
            className="ms-3"
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Form validation
        if (!eid) {
            setError('Event ID is missing');
            return;
        }

        if (photoData.photos.length === 0) {
            setError('Please select at least one photo to upload');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // Create form data for file upload
        const formData = new FormData();

        if (photoData.title) {
            formData.append('title', photoData.title);
        }

        if (photoData.description) {
            formData.append('description', photoData.description);
        }

        // Append all photos to the FormData
        photoData.photos.forEach(photo => {
            formData.append('photo', photo);
        });

        // Add a query parameter to indicate multiple file upload
        const uploadUrl = `/organizations/${id}/events/${eid}/photos?multiple=true`;

        try {
            // Make API call to upload photos
            await uploadEventPhoto(id as string, eid as string, formData, true, progress => {
                setUploadProgress(progress);
            });
            console.log('Photos uploaded successfully');

            // Redirect back to event photos page
            navigate(`/organizations/${id}/events/${eid}/photos`);
        } catch (error: any) {
            console.error('Error uploading photos:', error);

            // Handle specific error messages from the API
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('Failed to upload photos. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Row className="g-0">
                <Col md="auto" className="sidebar-container">
                    <Sidebar />
                </Col>
                <Col className="main-content p-0">
                    <div className="sticky-top bg-dark z-3">
                        <Row>
                            <TopBar
                                rightComponents={rightComponents}
                            />
                        </Row>
                    </div>
                    <div className="upload-photo-page bg-dark text-light min-vh-100">
                        {/* Main Content */}
                        <Container fluid className="px-4 pt-4">
                            <Row className="justify-content-center">
                                <Col xs={12} md={8} lg={6}>
                                    <h1
                                        className="text-center mb-5"
                                        style={{ fontFamily: 'Michroma, sans-serif' }}
                                    >
                                        Photos
                                    </h1>

                                    <div className="text-center mb-5">
                                        <h2
                                            className="fs-1"
                                            style={{ fontFamily: 'Michroma, sans-serif' }}
                                        >
                                            Upload your Event Photos below!
                                        </h2>
                                    </div>

                                    {error && (
                                        <div className="alert alert-danger my-3" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-4" controlId="photoTitle">
                                            <Form.Label
                                                style={{ fontFamily: 'Michroma, sans-serif' }}
                                                className="fs-4"
                                            >
                                                Photo Title
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter photo title"
                                                value={photoData.title}
                                                onChange={handleTitleChange}
                                                className="bg-white border-secondary py-3"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4" controlId="photoDescription">
                                            <Form.Label
                                                style={{ fontFamily: 'Michroma, sans-serif' }}
                                                className="fs-4"
                                            >
                                                Photo Description
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter photo description"
                                                value={photoData.description}
                                                onChange={handleDescriptionChange}
                                                className="bg-white border-secondary py-3"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4" controlId="photoFile">
                                            <Form.Label
                                                style={{ fontFamily: 'Michroma, sans-serif' }}
                                                className="fs-4"
                                            >
                                                Upload your Photos
                                            </Form.Label>

                                            {previewUrls.length > 0 && (
                                                <div className="mb-3">
                                                    <h5 className="mb-3">
                                                        {photoData.photos.length} photos selected
                                                    </h5>
                                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                                        {previewUrls.map((url, index) => (
                                                            <div
                                                                key={index}
                                                                className="position-relative"
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={`Photo preview ${index + 1}`}
                                                                    style={{
                                                                        height: '100px',
                                                                        width: '100px',
                                                                        objectFit: 'cover',
                                                                    }}
                                                                    className="border rounded"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* File upload wrapper with controlled width */}
                                            <div>
                                                <div style={{ width: '66.7%' }}>
                                                    {' '}
                                                    {/* This makes it 2/3 width */}
                                                    <Form.Control
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        multiple
                                                        className="bg-white text-dark border-secondary rounded-3"
                                                    />
                                                </div>
                                                <small className="text-muted d-block mt-2">
                                                    You can select multiple photos at once. Maximum
                                                    10 photos, 5MB each.
                                                </small>
                                            </div>
                                        </Form.Group>

                                        {isSubmitting && uploadProgress > 0 && (
                                            <div className="my-3">
                                                <div className="progress">
                                                    <div
                                                        className="progress-bar progress-bar-striped progress-bar-animated"
                                                        role="progressbar"
                                                        style={{ width: `${uploadProgress}%` }}
                                                        aria-valuenow={uploadProgress}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                    >
                                                        {uploadProgress}%
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className="position-relative mt-5 pt-5"
                                            style={{ height: '250px', zIndex: 1100 }}
                                        >
                                            <div
                                                className="position-absolute"
                                                style={{
                                                    left: '-200px',
                                                    top: '200px',
                                                    zIndex: 1100,
                                                }}
                                            >
                                                <Button
                                                    variant="secondary"
                                                    onClick={() =>
                                                        navigate(
                                                            `/organizations/${id}/events/${eid}/photos`
                                                        )
                                                    }
                                                    disabled={isSubmitting}
                                                    className="py-2 px-4"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>

                                            <div
                                                className="position-absolute"
                                                style={{
                                                    right: '-200px',
                                                    top: '200px',
                                                    zIndex: 1100,
                                                }}
                                            >
                                                <Button
                                                    variant="secondary"
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="py-2 px-4"
                                                >
                                                    {isSubmitting
                                                        ? `Uploading ${photoData.photos.length} photo${photoData.photos.length !== 1 ? 's' : ''}...`
                                                        : `Upload ${photoData.photos.length || 'No'} Photo${photoData.photos.length !== 1 ? 's' : ''}`}
                                                </Button>
                                            </div>
                                        </div>
                                    </Form>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default UploadEventPhoto;
