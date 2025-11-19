import React, { useEffect, useRef, useState } from 'react'
import './UploadFile.css'

function UploadPage() {
    const fileInputRef = useRef(null)
    const formRef = useRef(null)
    const buttonRef = useRef(null);
    const [fileData, setFileData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [vehicles, setVehicles] = useState([])

    // Fetch vehicles when component loads
    useEffect(() => {
        fetch('http://127.0.0.1:3000/vehicles')
            .then(res => res.json())
            .then(data => setVehicles(data))
            .catch(err => console.error('Error fetching vehicles:', err))
    }, [])

    return (
        <div>
            <header style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '30px 30px',
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
                <h1 style={{ margin: 0, fontSize: '24px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    Upload a Dataset
                </h1>
                <div></div>
            </header>

            <div style={{ marginTop: '80px', padding: '20px' }}>
                <form ref={formRef} onSubmit={async (e) => {
                    e.preventDefault()

                    console.log('Form submitted')

                    const files = fileInputRef.current?.files
                    if (!files || files.length === 0) {
                        setFileData('Please select a file')
                        return
                    }

                    const fd = new FormData(formRef.current)

                    console.log('FormData contents:')
                    for (let [key, value] of fd.entries()) {
                        console.log(key, value)
                    }

                    setLoading(true)
                    setFileData('Sending request...')

                    try {
                        console.log('About to fetch...')

                        const res = await fetch('http://127.0.0.1:3000/datasets/upload', {
                            method: 'POST',
                            body: fd
                        })

                        console.log('Fetch completed, status:', res.status)

                        if (!res.ok) {
                            const errorData = await res.json().catch(() => ({}))
                            throw new Error(errorData.error || `Upload failed: ${res.status}`)
                        }

                        const result = await res.json()
                        console.log('Result:', result)
                        setFileData(`Upload success! Dataset ID: ${result.id}`)
                    } catch (err) {
                        console.error('Upload error:', err)
                        setFileData('Upload error: ' + err.message)
                    } finally {
                        setLoading(false)
                    }
                }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <label htmlFor="myFile" style={{ width: '200px' }}>
                                    <span style={{ color: 'red' }}>*</span>Choose File:
                                </label>
                                <input ref={fileInputRef} type="file" id="myFile" name="file" accept=".txt,.json" style={{ width: '200px', padding: '5px', fontSize: '15px' }} required />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <label htmlFor="myTitle" style={{ width: '200px' }}>
                                    <span style={{ color: 'red' }}>*</span>Title:
                                </label>
                                <input type="text" id="myTitle" name="title" style={{ width: '200px', padding: '5px', fontSize: '14px' }} required placeholder={"e.g. 11-17-2025 Testing Day"}/>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <label htmlFor="myDesc" style={{ width: '200px' }}>Description:</label>
                                <textarea id="myDesc" name="description" rows="5" style={{ width: '200px' }} placeholder={"e.g. This data was collected at the Iron Mountain testing track and focuses on brake pressure and RPM..."}></textarea>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <label htmlFor="myDate" style={{ width: '200px' }}>
                                    <span style={{ color: 'red' }}>*</span>Date & Time:
                                </label>
                                <input type="datetime-local" id="myDate" name="date" style={{ width: '200px', padding: '5px', fontSize: '14px' }} required/>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <label htmlFor="myLocation" style={{ width: '200px' }}>Location ID:</label>
                                <input type="text" id="myLocation" name="location_id" style={{ width: '200px', padding: '5px', fontSize: '14px' }} placeholder={"e.g. Iron Mountain"}/>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <label htmlFor="vehicleSelect" style={{ width: '200px' }}>
                                    Vehicle:
                                </label>
                                <select id="vehicleSelect" name="vehicle_id" style={{ width: '200px', padding: '5px', fontSize: '14px' }}>
                                    <option value="">Select a vehicle...</option>
                                    {vehicles.map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <label htmlFor="compCheck" style={{ width: '200px' }}>
                                    <span style={{ color: 'red' }}>*</span>Was this data from a competition?
                                </label>
                                <select id="compCheck" name="competition" style={{ width: '200px', padding: '5px', fontSize: '14px' }} required>
                                    <option value="">Select...</option>
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px', paddingTop: '100px' }}>
                            <button className={"logo"} ref={buttonRef} type="submit" disabled={loading}>
                                {loading ? 'Uploading...' : 'Upload File'}
                            </button>
                        </div>
                    </div>
                </form>

                {fileData && (
                    <div style={{ marginTop: 12 }}>
                        <strong>Result:</strong>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{fileData}</pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UploadPage