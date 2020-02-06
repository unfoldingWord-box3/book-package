/// <reference types="Cypress" />

describe('Book Package Total Tests', function () {
    before(() => {
        cy.visit('/')
    })

    it('Should be at home page with README', function () {
        cy.get('.rsg--sectionName-12').should('have.text', 'README')
    })

    // NOTE: this will be found only after all the other components have 
    // set their data in the database. So this has a long timeout.
    // Once it is able to run, then the others will have also finished.
    // Thus they don't need to have a long timeout.
    it('Should find a total of 59931 words in Titus', function() {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()
        cy.get('.BookPackageTotals-root-60 > .MuiPaper-elevation1 > .MuiTypography-gutterBottom > strong',  { timeout: 100000 })
        .should('have.text','59931')
    })


    it('Should find 195 notes and 4202 words in UTN', function () {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()
        cy.get('.BookPackageTn-root-62 > .MuiPaper-elevation1 > .MuiTypography-body2.MuiTypography-gutterBottom > :nth-child(1)')
        .should('have.text', '195')
        cy.get('.BookPackageTn-root-62 > .MuiPaper-elevation1 > .MuiTypography-body2.MuiTypography-gutterBottom > :nth-child(3)')
        .should('have.text', '4202')
    })


    it('Should find 116 articles and 34307 words in UTW', function () {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()
        cy.get('.BookPackageTw-root-61 > .MuiPaper-root > :nth-child(2) > :nth-child(3)')
        .should('have.text', '116')
        cy.get('.BookPackageTw-root-61 > .MuiPaper-root > :nth-child(3) > :nth-child(1)')
        .should('have.text', '34088')
    })


    it('Should find 950 total words in ULT', function () {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()
        cy.get('.BookPackageUlt-root-65 > .MuiPaper-elevation1 > .MuiTypography-body2.MuiTypography-gutterBottom > strong')        
        .should('have.text', '950')
    })

    it('Should find 1734 total words in UST', function () {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()
        cy.get('.BookPackageUst-root-66 > .MuiPaper-elevation1 > .MuiTypography-body2.MuiTypography-gutterBottom > strong')
        .should('have.text', '1734')
    })

    it('Should find 36 questions & 784 words in UTQ', function () {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()
        cy.get('.BookPackageTq-root-64 > .MuiPaper-elevation1 > :nth-child(2) > strong')
        .should('have.text', '36')
        cy.get('.BookPackageTq-root-64 > .MuiPaper-elevation1 > :nth-child(3) > strong')
        .should('have.text', '784')
    })

    it('Should find 19 articles & 15584 words in UTA', function () {
        // always return to the book package totals page
        cy.get(':nth-child(2) > .rsg--list-53 > .rsg--item-54 > .rsg--link-26')
        .click()
        cy.get('.BookPackageTa-root-63 > .MuiPaper-root > .MuiTypography-body2 > :nth-child(1)')
        .should('have.text', '19')
        cy.get('.BookPackageTa-root-63 > .MuiPaper-root > .MuiTypography-body2 > :nth-child(3)')
        .should('have.text', '18173')
    })

})