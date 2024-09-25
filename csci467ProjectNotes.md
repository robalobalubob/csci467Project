# CSCI 467 Project Notes
1. [Database Notes](#database-notes)
    - [Requirements](#requirements)
    - [Sales Associates](#sales-associates)
    - [Customers](#customers)
    - [Quotes](#quotes)
2. [Interface Notes](#interface-notes)
    - [Necessary Interfaces](#necessary-interfaces)
    - [Quote Entry](#quote-entry)
    - [Quote Finalization](#quote-finalization)
    - [Purchase Orders](#purchase-orders-1)
    - [Admin](#administration)
3. [General Notes](#general-notes)

[Project Statement](csci467ProjectStatement.md)


## Database Notes

### Requirements
* Sales Associates
* Quotes
* Purchase Orders
* Customers

### Sales Associates
* Name
* userID
* Password
* Accumulated Commission
* Address

### Customers
* Name
* Address
* Contact Info

### Quotes
* Line Items (Separate Entity?)
    * Free-form description
    * Price
* Secret Notes
    * Free-form text
* Discounts (Added during editing, number or percent)
* Submitting Associate
* Requesting Customer
* Date
* Finalized, Sanctioned, Ordered


### Purchase Orders
* Possibly subcategory of quotes, just updated
* Converted from quote
* Final Discount, final amount
* Processing Date
* Commission Rate

## Interface Notes

### Necessary Interfaces
- Internet accessible quote entry
- Onsite quote editing and finalization
- Quote into Purchase Orders
- Administrative

### Quote Entry
- Accessible from the internet
- Associates login for access
- Allows for the creation of quotes
- Takes in customer data
- Should have input selection and ability to reselect line items and secret notes
- Quotes only submitted once
    - Store quotes locally then submit

### Quote Finalization
- Runs in-house
- Quotes submitted in Quote Entry can be retrieved and edited
- Discounts can be applied, number or percentage
- Final price from line items and discount
- Secret notes can be reviewed and added
- Quotes are then left unresolved or sanctioned
- If sanctioned email customer
    - All info from quote except secret notes

### Purchase Orders
- Internal
- Customer will send go-ahead outside of scope
- Quote is converted into purchase order
- Additional discounts can be added
- Final total is calculated
- Order is sent to an external service which returns a process date and commission rate
- Compute commission and add to sales rep's total
- Email customer with purchase details, including process date

### Administration
- Internal
- Access to view quotes
- Access to view and edit sales associate information

## General Notes
- Some items will be provided later marked in the project statement by details provided later
    - This is for the legacy customer database and the external processing system
- Necessary tables can't be fully generated without the customer table as a backbone