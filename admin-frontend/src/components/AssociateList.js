import React from 'react';
import api from '../services/api';

function AssociateList({ associates, onEdit, fetchAssociates }) {
    const handleDelete = async (associateId) => {
        if (window.confirm('Are you sure you want to delete this associate?')) {
            try {
                await api.delete(`/associates/${associateId}`);
                fetchAssociates();
            } catch (error) {
                console.error('Error deleting associate:', error);
                alert('Error deleting associate');
            }
        }
    };

    return (
        <div>
            <h2>Sales Associates</h2>
            <button onClick={() => onEdit({})}>Add New Associate</button>
            <table>
                <thead>
                    <tr>
                        <th>Associate ID</th>
                        <th>Name</th>
                        <th>User ID</th>
                        <th>Address</th>
                        <th>Accumulated Commission</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {associates.map((associate) => (
                        <tr key={associate.associateId}>
                        <td>{associate.associateId}</td>
                        <td>{associate.name}</td>
                        <td>{associate.userId}</td>
                        <td>{associate.address}</td>
                        <td>{parseFloat(associate.accumulatedCommission).toFixed(2)}</td>
                        <td>
                            <button onClick={() => onEdit(associate)}>Edit</button>
                            <button onClick={() => handleDelete(associate.associateId)}>Delete</button>
                        </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AssociateList;