// / <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.

// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// / <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
// ***********************************************
// / <reference types="cypress" />
// / <reference types="cypress" />
// / <reference types="cypress" />

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Login programmatically by setting token and user in localStorage
             */
            login(email: string, password: string): Chainable<Element>;

            /**
             * Mock authentication by setting a predefined user and token
             */
            mockAuth(): Chainable<Element>;

            /**
             * Fill password change form with specified values
             */
            fillPasswordForm(
                currentPassword: string,
                newPassword: string,
                confirmPassword: string
            ): Chainable<null>;

            /**
             * Set up mock user in the auth context
             */
            setupMockUser(
                overrides?: Partial<{
                    id: string;
                    email: string;
                    firstName: string;
                    lastName: string;
                    role: string;
                }>
            ): Chainable<Window>;

            /**
             * Mock the password change API response
             */
            mockPasswordChange(options: {
                success: boolean;
                errorMessage?: string;
                statusCode?: number;
            }): Chainable<null>;

            /**
             * Mock the account deletion API response
             */
            mockAccountDeletion(options: {
                success: boolean;
                errorMessage?: string;
                statusCode?: number;
            }): Chainable<null>;
        }
    }
}

// Add a custom Cypress command for login
Cypress.Commands.add('login', (email, password) => {
    // Intercept the login API request
    cy.intercept('POST', '/api/auth/login', req => {
        // Mock a successful response
        req.reply({
            statusCode: 200,
            body: {
                data: {
                    token: 'test-token',
                    user: {
                        id: '123',
                        email: email,
                        firstName: 'Test',
                        lastName: 'User',
                        role: 'user',
                    },
                },
            },
        });
    }).as('loginRequest');

    // Visit login page
    cy.visit('/login');

    // Fill in login form
    cy.get('#formEmail').type(email);
    cy.get('#formPassword').type(password);

    // Submit form
    cy.contains('Login').click();

    // Wait for login request to complete
    cy.wait('@loginRequest');

    // Ensure we're redirected to home
    cy.url().should('not.include', '/login');
});

// Add a custom Cypress command to mock authentication
Cypress.Commands.add('mockAuth', () => {
    const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
    };

    // Set token and user in localStorage
    cy.window().then(win => {
        win.localStorage.setItem('token', 'test-token');
        win.localStorage.setItem('user', JSON.stringify(mockUser));
    });
});

// Create reusable commands for filling the password form
// Use a type cast to force the return type
Cypress.Commands.add(
    'fillPasswordForm',
    function (
        currentPassword: string,
        newPassword: string,
        confirmPassword: string
    ): Cypress.Chainable<null> {
        // Do the operations without chaining
        cy.get('#currentPassword').clear();
        cy.get('#currentPassword').type(currentPassword);
        cy.get('#newPassword').clear();
        cy.get('#newPassword').type(newPassword);
        cy.get('#confirmPassword').clear();
        cy.get('#confirmPassword').type(confirmPassword);

        // Return null with double type assertion to force the correct type
        return cy.wrap(null) as unknown as Cypress.Chainable<null>;
    }
);

// Create a command to set up a mock user with defaults
Cypress.Commands.add('setupMockUser', (overrides = {}) => {
    const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        ...overrides,
    };

    return cy.window().then(win => {
        win.localStorage.setItem('token', 'test-token');
        win.localStorage.setItem('user', JSON.stringify(mockUser));
        return win;
    });
});

// Command to mock password change API
Cypress.Commands.add(
    'mockPasswordChange',
    function (options: {
        success: boolean;
        errorMessage?: string;
        statusCode?: number;
    }): Cypress.Chainable<null> {
        const {
            success,
            errorMessage = 'Current password is incorrect',
            statusCode = 401,
        } = options;

        cy.intercept('PATCH', '/api/auth/password', req => {
            // Fail when using "wrongpassword" as current password or when success is false
            if (req.body.currentPassword === 'wrongpassword' || !success) {
                return req.reply({
                    statusCode,
                    body: { message: errorMessage },
                });
            }

            // Successful response
            return req.reply({
                statusCode: 200,
                body: {
                    status: 'success',
                    message: 'Password updated successfully',
                },
            });
        }).as('changePassword');

        // Return null with double type assertion to force the correct type
        return cy.wrap(null) as unknown as Cypress.Chainable<null>;
    }
);

// Command to mock account deletion API
Cypress.Commands.add(
    'mockAccountDeletion',
    function (options: {
        success: boolean;
        errorMessage?: string;
        statusCode?: number;
    }): Cypress.Chainable<null> {
        const { success, errorMessage = 'Failed to delete account', statusCode = 500 } = options;

        cy.intercept('DELETE', '/api/auth/users/*', req => {
            if (!success) {
                return req.reply({
                    statusCode,
                    body: { message: errorMessage },
                });
            }

            return req.reply({
                statusCode: 200,
                body: {
                    status: 'success',
                    message: 'Account deleted successfully',
                },
            });
        }).as('deleteAccount');

        // Return null with double type assertion to force the correct type
        return cy.wrap(null) as unknown as Cypress.Chainable<null>;
    }
);

export {};
