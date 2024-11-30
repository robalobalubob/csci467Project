import React, { useState } from 'react';

function QuoteSearchForm({ onSearch }) {
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
        associateId: '',
        customerId: '',
    });

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(filters);
    };

    return (
        <div>
            <h2>Search Quotes</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Status:</label>
                    <select name="status" value={filters.status} onChange={handleChange}>
                        <option value="">Any</option>
                        <option value="submitted">Submitted</option>
                        <option value="unresolved">Unresolved</option>
                        <option value="sanctioned">Sanctioned</option>
                        <option value="ordered">Ordered</option>
                    </select>
                </div>
                <div>
                    <label>Start Date:</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} />
                </div>
                <div>
                    <label>End Date:</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
                </div>
                <div>
                    <label>Associate ID:</label>
                    <input
                        name="associateId"
                        value={filters.associateId}
                        onChange={handleChange}
                        type="number"
                    />
                </div>
                <div>
                    <label>Customer ID:</label>
                    <input
                        name="customerId"
                        value={filters.customerId}
                        onChange={handleChange}
                        type="number"
                    />
                </div>
                <button type="submit">Search Quotes</button>
            </form>
        </div>
    );
}

export default QuoteSearchForm;