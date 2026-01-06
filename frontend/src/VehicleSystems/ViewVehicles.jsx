import React, { useState, useEffect } from 'react'
import './Vehicle.css'
import { api } from '../api/backend.js'
function VehicleView() {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({ title: '', description: '' })

    useEffect(() => {
        fetchVehicles()
    }, [])

    const fetchVehicles = () => {
        setLoading(true)
        api.getVehicles()
            .then(data => {
                setVehicles(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }

    const startEditing = (vehicle) => {
        setEditingId(vehicle.id)
        setEditForm({
            title: vehicle.title,
            description: vehicle.description || ''
        })
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditForm({ title: '', description: '' })
    }

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`http://127.0.0.1:3000/vehicles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.error || 'Failed to update vehicle')
            }

            // Refresh the list
            fetchVehicles()
            setEditingId(null)
            setEditForm({ title: '', description: '' })
        } catch (err) {
            alert('Error updating vehicle: ' + err.message)
        }
    }

    const deleteVehicle = async (id, title) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`)
        if (!confirmed) return

        try {
            const res = await fetch(`http://127.0.0.1:3000/vehicles/${id}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                throw new Error('Failed to delete vehicle')
            }

            // Refresh the list
            fetchVehicles()
        } catch (err) {
            alert('Error deleting vehicle: ' + err.message)
        }
    }

    return (
        <div>
            <header style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '15px 30px',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        backgroundColor: '#34495e',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    ← Home
                </button>
                <h1 style={{ margin: 0, fontSize: '24px' }}>
                    View Vehicles
                </h1>
                <button
                    onClick={() => window.location.href = '/UploadVehicle'}
                    style={{
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    + Upload a Vehicle
                </button>
            </header>

            <div style={{ marginTop: '80px', padding: '20px' }}>
                {loading && <p>Loading vehicles...</p>}

                {error && (
                    <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>
                        Error: {error}
                    </div>
                )}

                {!loading && !error && vehicles.length === 0 && (
                    <p>No vehicles found. Click "+ Upload Vehicle" to add one!</p>
                )}

                {!loading && !error && vehicles.length > 0 && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {vehicles.map(vehicle => (
                            <div
                                key={vehicle.id}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                {editingId === vehicle.id ? (
                                    // Edit mode
                                    <div>
                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                                Title:
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    fontSize: '16px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccc'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                                Description:
                                            </label>
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                rows="4"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    fontSize: '14px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccc'
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => saveEdit(vehicle.id)}
                                                style={{
                                                    backgroundColor: '#27ae60',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                style={{
                                                    backgroundColor: '#95a5a6',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <div>
                                        <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                                            {vehicle.title}
                                        </h2>

                                        {vehicle.description && (
                                            <p style={{ margin: '10px 0', color: '#555' }}>
                                                {vehicle.description}
                                            </p>
                                        )}

                                        <div style={{ marginTop: '15px', fontSize: '14px', color: '#777' }}>
                                            <div><strong>Uploaded:</strong> {new Date(vehicle.uploaded_at).toLocaleString()}</div>
                                            <div><strong>Updated:</strong> {new Date(vehicle.updated_at).toLocaleString()}</div>
                                        </div>

                                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => startEditing(vehicle)}
                                                style={{
                                                    backgroundColor: '#3498db',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteVehicle(vehicle.id, vehicle.title)}
                                                style={{
                                                    backgroundColor: '#e74c3c',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default VehicleView
