import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../../utils/test-utils';
import CreateOrganization from './CreateOrganization';

// Mock functions
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock createOrganization API call
jest.mock('../../context/OrganizationService', () => ({
    createOrganization: jest.fn().mockResolvedValue({ data: { id: '123', name: 'Test Org' } }),
}));

describe('CreateOrganization Component', () => {
    beforeEach(() => {
        // Clear mocks between tests
        mockNavigate.mockClear();
    });

    test('renders form elements correctly', () => {
        renderWithRouter(<CreateOrganization />);

        // Check if title and instructions are rendered
        expect(screen.getByText('Organizations')).toBeInTheDocument();
        expect(screen.getByText('Start to create your Organization below!')).toBeInTheDocument();

        // Check for form elements
        expect(screen.getByLabelText(/Organization Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Upload your Organization logo/i)).toBeInTheDocument();

        // Check for buttons
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Create Organization/i })).toBeInTheDocument();
    });

    test('validates organization name on submission', async () => {
        renderWithRouter(<CreateOrganization />);

        // Try to submit the form without entering a name
        fireEvent.click(screen.getByRole('button', { name: /Create Organization/i }));

        // Check for validation error
        await waitFor(() => {
            expect(screen.getByText('Organization name is required')).toBeInTheDocument();
        });
    });

    test('handles file upload correctly', async () => {
        renderWithRouter(<CreateOrganization />);

        // Create a mock file
        const file = new File(['test'], 'test-logo.png', { type: 'image/png' });

        // Upload the file
        const fileInput = screen.getByLabelText(/Upload your Organization logo/i);
        fireEvent.change(fileInput, { target: { files: [file] } });

        // There's no visible change in the DOM for the file input value,
        // but we can check that the file is accepted (no error messages)
        await waitFor(() => {
            expect(screen.queryByText(/Please select an image file/i)).not.toBeInTheDocument();
        });
    });

    test('rejects non-image files', async () => {
        renderWithRouter(<CreateOrganization />);

        // Create a mock non-image file
        const file = new File(['test'], 'test-doc.pdf', { type: 'application/pdf' });

        // Upload the file
        const fileInput = screen.getByLabelText(/Upload your Organization logo/i);
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Check for error message
        await waitFor(() => {
            expect(screen.getByText('Please select an image file')).toBeInTheDocument();
        });
    });

    test('navigates back when cancel button is clicked', () => {
        renderWithRouter(<CreateOrganization />);

        // Click cancel button
        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

        // Check if navigation was called
        expect(mockNavigate).toHaveBeenCalledWith('/organizations');
    });

    test('submits form with valid data', async () => {
        renderWithRouter(<CreateOrganization />);

        // Fill in organization name
        const nameInput = screen.getByLabelText(/Organization Name/i);
        fireEvent.change(nameInput, { target: { value: 'Test Organization' } });

        // Create a mock file
        const file = new File(['test'], 'test-logo.png', { type: 'image/png' });

        // Upload the file
        const fileInput = screen.getByLabelText(/Upload your Organization logo/i);
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Create Organization/i }));

        // Check if navigation was called after successful submission
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/organizations');
        });
    });
});
