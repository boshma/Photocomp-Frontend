import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import Sidebar from './SideBar';

// Wrap the component with BrowserRouter in render function
const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>); // Render with BrowserRouter
};

// Test for Sidebar navigation links
describe('Sidebar Component', () => {
    // Test for image
    it('renders image with alt text', () => {
        renderWithRouter(<Sidebar />); // Use renderWithRouter to wrap Sidebar
        const img = screen.getByAltText('Logo') as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img.src).toContain('test-file-stub'); // Match the mocked path, not 'mocked-image-path'
    });

    it('renders sidebar with nav links', () => {
        renderWithRouter(<Sidebar />);

        // Check navigation links
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Organizations')).toBeInTheDocument();
        expect(screen.getByText('Events')).toBeInTheDocument();
        expect(screen.getByText('Photos')).toBeInTheDocument();
    });

    it('renders toggle button', () => {
        renderWithRouter(<Sidebar />);
        const toggle = screen.getByRole('button');
        expect(toggle).toBeInTheDocument();
        expect(toggle).toHaveAttribute('aria-controls', 'responsive-navbar-nav');
    });
});
