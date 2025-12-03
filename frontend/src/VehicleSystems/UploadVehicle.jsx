import React, { useRef, useState } from 'react'
import './Vehicle.css'

function VehiclePage() {
    const formRef = useRef(null)
    const buttonRef = useRef(null);
    const [fileData, setFileData] = useState(null)
    const [loading, setLoading] = useState(false)


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
                    Upload a Vehicle
                </h1>
                <div></div>
                <button
                    onClick={() => window.location.href = '/ViewVehicles'}
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
                    View Vehicles
                </button>
            </header>

            <div style={{ marginTop: '80px', padding: '20px' }}>
                <form ref={formRef} onSubmit={async (e) => {
                    e.preventDefault()

                    const confirmed = window.confirm(
                        'Before you add a new vehicle, please confirm it doesn\'t already exist on the vehicles page.'
                    )

                    if (!confirmed) {
                        return // Stop submission if user clicks Cancel
                    }

                    console.log('Form submitted')

                    setLoading(true)
                    setFileData('Sending request...')

                    try {
                        console.log('About to fetch...')

                        const res = await fetch('http://127.0.0.1:3000/vehicles/upload', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                title: formRef.current.title.value,
                                description: formRef.current.description.value
                            })
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
                                <label htmlFor="myTitle" style={{ width: '200px' }}>
                                    <span style={{ color: 'red' }}>*</span>Car Title:
                                </label>
                                <input type="text" id="myTitle" name="title" style={{ width: '200px', padding: '5px', fontSize: '14px' }} required placeholder={"e.g. OR9"}/>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                <label htmlFor="myDesc" style={{ width: '200px' }}>Description:</label>
                                <textarea id="myDesc" name="description" rows="5" style={{ width: '200px' }} placeholder={"e.g. This car was used for competitions in 1492. It has a 1 hp engine and AWD."}></textarea>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px', paddingTop: '0px' }}>
                            <button className={"logo"} ref={buttonRef} type="submit" disabled={loading}>
                                {loading ? 'Uploading...' : 'Upload Vehicle'}
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

export default VehiclePage