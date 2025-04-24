import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import Members from './pages/Members/Members';
import Membership from './pages/Membership/Membership';
import Organizations from './pages/Organizations/ViewOrganizations';
import SingleEvents from './pages/Events/SingleEvents';
import Events from './pages/Events/ViewEvents';
import Photos from './pages/Photos/viewPhotos';
import ProtectedRoute from './components/routes/ProtectedRoute/ProtectedRoute';
import Footer from './components/bars/Footer/Footer';
import AccountSettings from './pages/AccountSettings/AccountSettings';
import CreateOrganization from './pages/Organizations/CreateOrganization/CreateOrganization';
import Logout from './pages/Logout';
import UploadEventPhoto from './pages/Events/UploadEventPhoto';
import CreateEvent from './pages/Events/CreateEvent';
import PhotoGalleryPage from './pages/PhotoGallery/PhotoGalleryPage';
import PhotoTaggingPage from './pages/PhotoTagging/PhotoTaggingPage';
import OrganizationDetails from './pages/Organizations/OrganizationDetails';
import EventDetails from './pages/Events/EventDetails';

function App() {
    return (
        <>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/" element={<Home />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/events" element={<Events />} />
                <Route
                    path="/organizations/create"
                    element={
                        <ProtectedRoute>
                            <CreateOrganization />
                        </ProtectedRoute>
                    }
                />
                <Route path="/organizations/:id/details" element={<OrganizationDetails />} />
                <Route path="/organizations/:id/events" element={<SingleEvents />} />
                <Route
                    path="/account-settings"
                    element={
                        <ProtectedRoute>
                            <AccountSettings />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organizations/:orgId/members/requests"
                    element={
                        <ProtectedRoute>
                            <Membership />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organizations/:id/events/create"
                    element={
                        <ProtectedRoute>
                            <CreateEvent />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organizations/:id/events/:eid/details"
                    element={
                        <ProtectedRoute>
                            <EventDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organizations/:orgId/members"
                    element={
                        <ProtectedRoute>
                            <Members />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organizations/:id/events/:eid/photos"
                    element={
                        <ProtectedRoute>
                            <Photos />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organizations/:id/events/:eid/photos/upload"
                    element={
                        <ProtectedRoute>
                            <UploadEventPhoto />
                        </ProtectedRoute>
                    }
                />
                {/* for viewing individual photos in the carousel */}
                <Route
                    path="/organizations/:id/events/:eid/photos/:photoId"
                    element={
                        <ProtectedRoute>
                            <PhotoGalleryPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organizations/:id/events/:eid/photos/:photoId/tag"
                    element={
                        <ProtectedRoute>
                            <PhotoTaggingPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
