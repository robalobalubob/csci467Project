import React, { useState } from 'react';
import api from '../services/api';

function AssociateForm({ associate, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: associate?.name || '',
        userId: associate?.userId || '',
        password: '',
        address: associate?.address || '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData };
            if (associate && associate.associateId) {
                // Update existing associate

                // Remove password field if it's empty
                if (!formData.password) {
                    delete dataToSend.password;
                }

                await api.put(`/associates/${associate.associateId}`, formData);
            } else {
                // Create new associate
                await api.post('/associates', formData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving associate:', error);
        }
    };

    return (
        <div>
            <h2>{associate && associate.associateId ? 'Edit Associate' : 'Add New Associate'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>User ID:</label>
                    <input name="userId" value={formData.userId} onChange={handleChange} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!associate || !associate.associateId}
                    />
                </div>
                <div>
                    <label>Address:</label>
                    <input name="address" value={formData.address} onChange={handleChange} />
                </div>
            <button type="submit">Save Associate</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
        </div>
    );
}

export default AssociateForm;