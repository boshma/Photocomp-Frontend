/// <reference types="cypress" />
import React from 'react';
import AccountSettings from '../../src/pages/AccountSettings/AccountSettings';

describe('AccountSettings Component', () => {
    beforeEach(() => {
        // Instead of stubbing, intercept actual API calls
        cy.intercept('PATCH', '/api/auth/password', {
            statusCode: 200,
            body: { status: 'success', message: 'Password updated successfully' },
        }).as('changePassword');

        cy.intercept('DELETE', '/api/auth/users/*', {
            statusCode: 200,
            body: { status: 'success', message: 'Account deleted successfully' },
        }).as('deleteAccount');
    });

    // Define setup function for component tests
    const mountComponent = (options: any = {}) => {
        const {
            user = {
                id: '123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                role: 'user',
            },
        } = options;

        // Create auth context with mocked functions
        const mockAuthContext = {
            user,
            token: 'test-token',
            setUser: cy.stub().as('setUserStub'),
            setToken: cy.stub().as('setTokenStub'),
            logout: cy.stub().as('logoutStub'),
        };

        // Mount the component with context
        cy.mountWithAuth(<AccountSettings />, mockAuthContext);
    };

    describe('Component Tests', () => {
        it('displays account information correctly', () => {
            mountComponent();

            cy.contains('Account Settings').should('be.visible');
            cy.contains('Personal Information').should('be.visible');
            cy.contains('Account name: Test User').should('be.visible');
            cy.contains('Account Email: test@example.com').should('be.visible');
            cy.contains('Account Type: user').should('be.visible');
        });

        it('validates password change form', () => {
            mountComponent();

            // Try submitting empty form
            cy.contains('button', 'Save Changes').click();

            cy.contains('Current password is required').should('be.visible');

            // Fill current password but leave new passwords empty
            cy.get('#currentPassword').type('password123');
            cy.contains('button', 'Save Changes').click();

            cy.contains('New password is required').should('be.visible');

            // Test password mismatch
            cy.get('#newPassword').type('newpassword123');
            cy.get('#confirmPassword').type('differentpassword');
            cy.contains('button', 'Save Changes').click();

            cy.contains('New passwords do not match').should('be.visible');
        });

        it('successfully changes password', () => {
            mountComponent();

            // Fill form with valid data
            cy.get('#currentPassword').type('password123');
            cy.get('#newPassword').type('newpassword123');
            cy.get('#confirmPassword').type('newpassword123');

            // Submit the form
            cy.contains('button', 'Save Changes').click();

            // Check success message
            cy.contains('Password successfully updated').should('be.visible');

            // Check form is reset
            cy.get('#currentPassword').should('have.value', '');
            cy.get('#newPassword').should('have.value', '');
            cy.get('#confirmPassword').should('have.value', '');
        });

        it('validates delete account confirmation', () => {
            mountComponent();

            // Delete button should be disabled initially
            cy.contains('button', 'Delete Account').should('be.disabled');

            // Type incorrect confirmation
            cy.get('#deleteConfirmation').type('delete');
            cy.contains('button', 'Delete Account').should('be.disabled');

            // Type correct confirmation
            cy.get('#deleteConfirmation').clear().type('Delete');
            cy.contains('button', 'Delete Account').should('not.be.disabled');
        });

        it('successfully deletes account', () => {
            // Create a spy just for this specific test
            const logoutSpy = cy.spy().as('logoutSpy');

            // Pass the spy directly to our component via modified context
            const customAuthContext = {
                user: {
                    id: '123',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    role: 'user',
                },
                token: 'test-token',
                setUser: cy.stub(),
                setToken: cy.stub(),
                logout: logoutSpy,
            };

            // Mount with our custom context
            cy.mountWithAuth(<AccountSettings />, customAuthContext);

            // Type correct confirmation
            cy.get('#deleteConfirmation').type('Delete');

            // Click delete button and wait for API call
            cy.contains('button', 'Delete Account').click();
            cy.wait('@deleteAccount');

            // Check if our spy was called
            cy.get('@logoutSpy').should('have.been.called');
        });
    });

    describe('Testing error cases', () => {
        it('handles password change API error', () => {
            // Override the intercept for this specific test
            cy.intercept('PATCH', '/api/auth/password', {
                statusCode: 401,
                body: { message: 'Current password is incorrect' },
            }).as('changePasswordError');

            mountComponent();

            // Fill form with valid data
            cy.get('#currentPassword').type('password123');
            cy.get('#newPassword').type('newpassword123');
            cy.get('#confirmPassword').type('newpassword123');

            // Submit the form
            cy.contains('button', 'Save Changes').click();

            // Check error message
            cy.contains('Current password is incorrect').should('be.visible');
        });

        it('handles delete account API error', () => {
            // Override the intercept for this specific test
            cy.intercept('DELETE', '/api/auth/users/*', {
                statusCode: 500,
                body: { message: 'Failed to delete account' },
            }).as('deleteAccountError');

            mountComponent();

            // Type correct confirmation
            cy.get('#deleteConfirmation').type('Delete');

            // Click delete button
            cy.contains('button', 'Delete Account').click();

            // Check error message
            cy.contains('Failed to delete account').should('be.visible');
        });
    });
});
