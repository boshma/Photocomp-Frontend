describe('Account Settings Page', () => {
    beforeEach(() => {
        // Set up mock user
        cy.setupMockUser();

        // Set up API mocks with default success responses
        cy.mockPasswordChange({ success: true });
        cy.mockAccountDeletion({ success: true });

        // Visit the account settings page
        cy.visit('/account-settings');
    });

    describe('User Information Display', () => {
        it('displays user information correctly', () => {
            // Check if the page title is displayed
            cy.contains('h2', 'Account Settings').should('be.visible');

            // Check if personal information section is displayed
            cy.contains('h3', 'Personal Information').should('be.visible');

            // Check if user info is displayed correctly
            cy.contains('Account name: Test User').should('be.visible');
            cy.contains('Account Email: test@example.com').should('be.visible');
            cy.contains('Account Type: user').should('be.visible');
        });
    });

    describe('Password Change', () => {
        it('validates required form fields', () => {
            // Try submitting with empty current password
            cy.contains('button', 'Save Changes').click();
            cy.contains('Current password is required').should('be.visible');

            // Fill current password but leave new password empty
            cy.get('#currentPassword').type('password123');
            cy.contains('button', 'Save Changes').click();
            cy.contains('New password is required').should('be.visible');

            // Test password length validation
            cy.fillPasswordForm('password123', 'short', 'short');
            cy.contains('button', 'Save Changes').click();
            cy.contains('Password must be at least 8 characters long').should('be.visible');
        });

        it('validates password match', () => {
            // Fill non-matching passwords
            cy.fillPasswordForm('password123', 'newpassword123', 'differentpassword');
            cy.contains('button', 'Save Changes').click();
            cy.contains('New passwords do not match').should('be.visible');
        });

        it('successfully changes password', () => {
            // Fill form with valid data
            cy.get('#currentPassword').clear().type('password123');
            cy.get('#newPassword').clear().type('newpassword123');
            cy.get('#confirmPassword').clear().type('newpassword123');

            // Submit the form
            cy.contains('button', 'Save Changes').click();

            // Wait for the API call
            cy.wait('@changePassword');

            // Check for success message
            cy.contains('Password successfully updated').should('be.visible');

            // Check if form is reset
            cy.get('#currentPassword').should('have.value', '');
            cy.get('#newPassword').should('have.value', '');
            cy.get('#confirmPassword').should('have.value', '');
        });

        it('handles incorrect current password', () => {
            // Fill form with wrong current password
            cy.fillPasswordForm('wrongpassword', 'newpassword123', 'newpassword123');

            // Submit the form
            cy.contains('button', 'Save Changes').click();

            // Wait for the API call
            cy.wait('@changePassword');

            // Check for error message
            cy.contains('Current password is incorrect').should('be.visible');
        });

        it('resets form fields when cancel button is clicked', () => {
            // Fill form fields
            cy.get('#currentPassword').clear().type('password123');
            cy.get('#newPassword').clear().type('newpassword123');
            cy.get('#confirmPassword').clear().type('newpassword123');

            // Click cancel button
            cy.contains('button', 'Cancel').click();

            // Check if fields are cleared
            cy.get('#currentPassword').should('have.value', '');
            cy.get('#newPassword').should('have.value', '');
            cy.get('#confirmPassword').should('have.value', '');
        });
    });

    describe('Account Deletion', () => {
        it('validates delete confirmation input', () => {
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
            // Type correct confirmation
            cy.get('#deleteConfirmation').type('Delete');

            // Click delete button
            cy.contains('button', 'Delete Account').click();

            // Wait for the API call
            cy.wait('@deleteAccount');

            // Should redirect to login page
            cy.url().should('include', '/login');

            // Local storage should be cleared
            cy.window().then(win => {
                expect(win.localStorage.getItem('token')).to.be.null;
                expect(win.localStorage.getItem('user')).to.be.null;
            });
        });

        it('handles error when deleting account', () => {
            // Override the default mock with a failure case
            cy.mockAccountDeletion({ success: false });

            // Type correct confirmation
            cy.get('#deleteConfirmation').type('Delete');

            // Click delete button
            cy.contains('button', 'Delete Account').click();

            // Wait for the API call
            cy.wait('@deleteAccount');

            // Check for error message
            cy.contains('Failed to delete account').should('be.visible');

            // Should not redirect
            cy.url().should('include', '/account-settings');
        });
    });

    describe('Navigation', () => {
        it('navigates back to home when back button is clicked', () => {
            // Click the back button
            cy.contains('Back to Home').click();

            // Should navigate to home page
            cy.url().should('eq', Cypress.config('baseUrl') + '/');
        });
    });
});
