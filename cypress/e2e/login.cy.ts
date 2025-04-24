describe('Register Page', () => {
    const BASE_URL = 'http://localhost:5173';
    const API_URL = 'http://localhost:3000';

    it('Registers a new user', () => {
        const email = 'test@email.com';
        const password = '1234567890';

        cy.intercept('POST', API_URL + '/api/auth/login', { fixture: 'login-success.json' });
        cy.visit(BASE_URL + '/login');

        cy.get('#formEmail').type(email);
        cy.get('#formPassword').type(password);

        cy.get('button').contains('Login').click();

        // redirect
        cy.url().should('not.include', '/login');
    });
});
