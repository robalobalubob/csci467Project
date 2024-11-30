import React, { useState, useEffect } from 'react';
import AssociateList from './components/AssociateList';
import AssociateForm from './components/AssociateForm';
import QuoteSearchForm from './components/QuoteSearchForm';
import QuoteList from './components/QuoteList';
import api from './services/api';

function App() {
  const [editingAssociate, setEditingAssociate] = useState(null);
  const [associates, setAssociates] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [currentView, setCurrentView] = useState('associates'); // 'associates' or 'quotes'

  const fetchAssociates = async () => {
    try {
      const response = await api.get('/associates');
      setAssociates(response.data);
    } catch (error) {
      console.error('Error fetching associates:', error);
    }
  };

  useEffect(() => {
    fetchAssociates();
  }, []);

  const handleAssociateSave = () => {
    setEditingAssociate(null);
    fetchAssociates();
  };

  const handleAssociateCancel = () => {
    setEditingAssociate(null);
  };

  const handleSearchQuotes = async (filters) => {
    try {
      const response = await api.get('/quotes', { params: filters });
      setQuotes(response.data);
      setCurrentView('quotes');
    } catch (error) {
      console.error('Error searching quotes:', error);
    }
  };

  return (
    <div>
      <h1>Admin Interface</h1>
      <nav>
        <button onClick={() => setCurrentView('associates')}>Manage Associates</button>
        <button onClick={() => setCurrentView('quotes')}>View Quotes</button>
      </nav>

      {currentView === 'associates' && (
        <>
          {editingAssociate !== null ? (
            <AssociateForm
              associate={editingAssociate}
              onSave={handleAssociateSave}
              onCancel={handleAssociateCancel}
            />
          ) : (
            <AssociateList
              associates={associates}
              onEdit={setEditingAssociate}
              fetchAssociates={fetchAssociates}
            />
          )}
        </>
      )}

      {currentView === 'quotes' && (
        <>
          <QuoteSearchForm onSearch={handleSearchQuotes} />
          <QuoteList quotes={quotes} />
        </>
      )}
    </div>
  );
}

export default App;
