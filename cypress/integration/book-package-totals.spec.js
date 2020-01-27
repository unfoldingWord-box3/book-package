/// <reference types="Cypress" />

describe('Book Package Total Tests', function () {
    before(() => {
        cy.visit('/')
    })

    it('Should be at home page with README', function () {
        cy.get('.rsg--sectionName-12').should('have.text', 'README')
    })

    it('Should find a total of 57617 words in Titus', function() {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()

        cy.get('.BookPackageTotals-root-60 > .MuiPaper-elevation1 > .MuiTypography-gutterBottom > strong',  { timeout: 100000 })
        .should('have.text','57617')
    })


    it('Should find 118 unique UTW articles', function () {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()
        cy.get('.BookPackageTw-root-61 > .MuiPaper-root > :nth-child(2) > :nth-child(3)')
        .should('have.text', '118')
    })


    it('Should find 16 unique UTA articles', function () {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()
        cy.get('.BookPackageTa-root-63 > .MuiPaper-root > .MuiTypography-body2 > :nth-child(1)')
        .should('have.text', '16')
    })

})