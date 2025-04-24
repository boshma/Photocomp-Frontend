describe('Register Page', () => {
    const BASE_URL = 'http://localhost:5173';
    const API_URL = 'http://localhost:3000';

    it('Registers a new user', () => {
        const email = 'test@email.com';
        const password = '1234567890';
        const username = 'test1';
        const firstName = 'john';
        const lastName = 'doe';

        cy.intercept('POST', API_URL + '/api/auth/register', { fixture: 'register-success.json' });
        cy.visit(BASE_URL + '/register');

        cy.get('#formEmail').type(email);
        cy.get('#formPassword').type(password);
        cy.get('#formUsername').type(username);
        cy.get('#formFirstName').type(firstName);
        cy.get('#formLastName').type(lastName);

        cy.get('button').contains('Register').click();

        // redirect
        cy.url().should('not.include', '/register');
    });
});
