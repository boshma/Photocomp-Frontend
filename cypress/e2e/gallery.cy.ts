describe('Gallery Page', () => {
    it('should display gallery title', () => {
        cy.visit('http://localhost:5173');
        cy.contains('Organization').should('be.visible');
    });

    it('should display multiple organization cards', () => {
        cy.visit('http://localhost:5173');
        cy.get('.card').should('have.length.greaterThan', 0);
    });
});
