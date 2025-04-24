import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/global.css';
import './styles/footer.css';
import './styles/auth.css';
import './styles/organizationRow.css';
import './styles/galleryCard.css';
import './styles/SideBar.css';
import './styles/layout.css';
import './styles/navBarButton.css';
import './styles/accountSettings.css';
import './styles/createOrganization.css';
import './styles/membership.css';
import './styles/member.css';
import './styles/photoTagging.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import AuthProvider from './context/AuthProvider';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
