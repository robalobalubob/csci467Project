import React, { useState, useEffect } from 'react';
import QuoteSearchForm from './QuoteSearchForm';
import QuoteList from './QuoteList';
import api from '../services/api';
import '../App.css';

function QuotePage() {
  const [quotes, setQuotes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (filters) => {
    try {
      const response = await api.get('admin/quotes', { params: filters });
      setQuotes(response.data);
    } catch (error) {
      console.error('Error searching quotes:', error);
      alert('Error searching quotes');
    }
  };

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  useEffect(() => {
    const fetchDefaultQuotes = async () => {
      const defaultFilters = {};
      await handleSearch(defaultFilters);
    };

    fetchDefaultQuotes();
  }, []);

  return (
    <div className="form-group">
      <h2>Quotes</h2>
      <button
        className="button button-secondary toggle-filters-button"
        onClick={toggleFilters}
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>
      <div id="quote-search-form" className={showFilters ? '' : 'hidden'}>
        {showFilters && <QuoteSearchForm onSearch={handleSearch} />}
      </div>
      <QuoteList quotes={quotes} />
    </div>
  );
}

export default QuotePage;