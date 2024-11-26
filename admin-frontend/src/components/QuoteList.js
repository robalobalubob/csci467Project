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
                    <p>Quote ID: {quote.quoteId}</p>
                    <p>Status: {quote.status}</p>
                    <p>Associate ID: {quote.associateId}</p>
                    <p>Customer ID: {quote.customerId}</p>
                    <p>Created At: {new Date(quote.createdAt).toLocaleString()}</p>
                    <h4>Line Items:</h4>
                    <ul>
                    {quote.items.map((item) => (
                        <li key={item.lineItemId}>
                        <p>Description: {item.description}</p>
                        <p>Price: {item.price}</p>
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