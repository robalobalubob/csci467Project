import React, { useState } from 'react';
import api from '../services/api';

function AssociateForm({ associate, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: associate?.name || '',
        userId: associate?.userId || '',
        password: '',
        address: associate?.address || '',
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.userId.trim()) errors.userId = 'User ID is required';
        if (!associate?.associateId && !formData.password) errors.password = 'Password is required';
        return errors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const dataToSend = { ...formData };
            if (associate && associate.associateId) {
                // Update associate

                if (!formData.password) {
                    delete dataToSend.password;
                }

                await api.put(`/associates/${associate.associateId}`, dataToSend);
            } else {
                // Create new associate
                await api.post('/associates', dataToSend);
            }
            onSave();
        } catch (error) {
            console.error('Error saving associate:', error);
            alert('Error saving associate');
        }
    };

    return (
        <div>
            <h2>{associate && associate.associateId ? 'Edit Associate' : 'Add New Associate'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input name="name" value={formData.name} onChange={handleChange} required />
                    {errors.name && <p style={{ color: 'red' }}>{errors.name}</p>}
                </div>
                <div>
                    <label>User ID:</label>
                    <input name="userId" value={formData.userId} onChange={handleChange} required />
                    {errors.userId && <p style={{ color: 'red' }}>{errors.userId}</p>}
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
                    {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                    {associate && associate.associateId && <p>Leave blank to keep current password.</p>}
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