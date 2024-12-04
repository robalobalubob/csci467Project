import React from 'react';
import '../App.css';

/**
 * QuoteList Component
 * Displays a table of quotes.
 * @param {*} input quotes 
 * @returns React Display information
 */
function QuoteList({ quotes }) {
    return (
        <div className="form-group">
            {quotes.length === 0 ? (
                <p>No quotes found.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Quote ID</th>
                            <th>Status</th>
                            <th>Associate ID</th>
                            <th>Customer ID</th>
                            <th>Total Amount ($)</th>
                            <th>Created At</th>
                            <th>Line Items</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quotes.map((quote) => (
                            <tr key={quote.quoteId}>
                                <td>{quote.quoteId}</td>
                                <td>{quote.status}</td>
                                <td>{quote.associateId}</td>
                                <td>{quote.customerId}</td>
                                <td>{parseFloat(quote.totalAmount).toFixed(2)}</td>
                                <td>{new Date(quote.createdAt).toLocaleString()}</td>
                                <td>
                                    {quote.items.length > 0 ? (
                                        <table className="nested-table">
                                            <thead>
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Price ($)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quote.items.map((item) => (
                                                    <tr key={item.lineItemId}>
                                                        <td>{item.description}</td>
                                                        <td>{parseFloat(item.price).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p>No line items.</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default QuoteList;