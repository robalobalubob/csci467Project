import React, { useState } from 'react';
import '../App.css';

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
        <div className="form-group">
            <h2>Search Quotes</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <select 
                        id="status" 
                        name="status" 
                        value={filters.status} 
                        onChange={handleChange}
                    >
                        <option value="">Any</option>
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="unresolved">Unresolved</option>
                        <option value="sanctioned">Sanctioned</option>
                        <option value="ordered">Ordered</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="startDate">Start Date:</label>
                    <input 
                        type="date" 
                        id="startDate" 
                        name="startDate" 
                        value={filters.startDate} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="endDate">End Date:</label>
                    <input 
                        type="date" 
                        id="endDate" 
                        name="endDate" 
                        value={filters.endDate} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="associateId">Associate ID:</label>
                    <input
                        id="associateId"
                        name="associateId"
                        value={filters.associateId}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        placeholder="Enter Associate ID"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="customerId">Customer ID:</label>
                    <input
                        id="customerId"
                        name="customerId"
                        value={filters.customerId}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        placeholder="Enter Customer ID"
                    />
                </div>
                <div className="flex">
                    <button className='button' type="submit">Search Quotes</button>
                </div>
            </form>
        </div>
    );
}

export default QuoteSearchForm;