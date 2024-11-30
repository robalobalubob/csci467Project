import React from 'react';

function QuoteList({ quotes }) {
    return (
        <div>
            <h2>Quotes</h2>
            {quotes.length === 0 ? (
                <p>No quotes found.</p>
            ) : (
                <ul>
                    {quotes.map((quote) => (
                        <li key={quote.quoteId}>
                            <p><strong>Quote ID:</strong> {quote.quoteId}</p>
                            <p><strong>Status:</strong> {quote.status}</p>
                            <p><strong>Associate ID:</strong> {quote.associateId}</p>
                            <p><strong>Customer ID:</strong> {quote.customerId}</p>
                            <p><strong>Total Amount:</strong> ${parseFloat(quote.totalAmount).toFixed(2)}</p>
                            <p><strong>Created At:</strong> {new Date(quote.createdAt).toLocaleString()}</p>
                            <h4>Line Items:</h4>
                            <ul>
                                {quote.items.map((item) => (
                                <li key={item.lineItemId}>
                                    <p>Description: {item.description}</p>
                                    <p>Price: ${parseFloat(item.price).toFixed(2)}</p>
                                </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default QuoteList;