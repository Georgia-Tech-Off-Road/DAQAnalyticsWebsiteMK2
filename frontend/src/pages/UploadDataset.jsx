import React, { useEffect, useState } from 'react'
import { api } from '../api/backend.js'
import './UploadDataset.css'

const STEPS = ['upload', 'validate', 'metadata']

function StepIndicator({ current }) {
    const labels = ['Upload', 'Validate', 'Metadata']
    const currentIndex = STEPS.indexOf(current)

    return (
        <div className="step-indicator">
            {labels.map((label, i) => (
                <div key={label} className={`step ${i <= currentIndex ? 'step-active' : ''} ${i < currentIndex ? 'step-done' : ''}`}>
                    <span className="step-number">{i + 1}</span>
                    <span className="step-label">{label}</span>
                </div>
            ))}
        </div>
    )
}

function UploadStep({ onComplete }) {
    const [dragging, setDragging] = useState(false)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    function handleFile(f) {
        setFile(f)
        setError(null)
    }

    async function handleUpload() {
        if (!file) {
            setError('Please select a file')
            return
        }
        setLoading(true)
        setError(null)
        try {
            const result = await api.uploadTemp(file)
            onComplete(result.tempId)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="upload-step">
            <div
                className={`drop-zone ${dragging ? 'drop-zone-active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    if (e.dataTransfer.files.length > 0) {
                        handleFile(e.dataTransfer.files[0])
                    }
                }}
            >
                {file ? (
                    <p>{file.name}</p>
                ) : (
                    <p>Drag & drop a file here, or click to select</p>
                )}
                <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                        if (e.target.files.length > 0) handleFile(e.target.files[0])
                    }}
                />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="btn-primary" onClick={handleUpload} disabled={loading || !file}>
                {loading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    )
}

function ValidateStep({ tempId, onComplete }) {
    const [validation, setValidation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        api.validateTemp(tempId)
            .then((result) => {
                setValidation(result)
                setLoading(false)
            })
            .catch((err) => {
                setError(err.message)
                setLoading(false)
            })
    }, [tempId])

    if (loading) return <p>Validating...</p>
    if (error) return <p className="error-text">Validation error: {error}</p>

    return (
        <div className="validate-step">
            <p>{validation.valid ? 'File is valid.' : 'File has issues.'}</p>

            <button className="btn-primary" onClick={onComplete} disabled={!validation.valid}>
                Continue
            </button>
        </div>
    )
}

function MetadataStep({ tempId, onComplete }) {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        api.getVehicles()
            .then(data => setVehicles(data))
            .catch(err => console.error('Error fetching vehicles:', err))
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const fd = new FormData(e.target)
        const data = {
            tempId,
            title: fd.get('title'),
            description: fd.get('description') || null,
            date: fd.get('date'),
            location_id: fd.get('location_id') || null,
            vehicle_id: fd.get('vehicle_id') || null,
            competition: fd.get('competition') === '1',
        }

        try {
            const result = await api.confirmUpload(data)
            onComplete(result.id)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="metadata-step">
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="title"><span className="required">*</span>Title:</label>
                    <input type="text" id="title" name="title" required placeholder="e.g. 11-17-2025 Testing Day" />
                </div>

                <div className="form-field">
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" name="description" rows="4" placeholder="e.g. Data collected at Iron Mountain testing track..." />
                </div>

                <div className="form-field">
                    <label htmlFor="date"><span className="required">*</span>Date & Time:</label>
                    <input type="datetime-local" id="date" name="date" required />
                </div>

                <div className="form-field">
                    <label htmlFor="location_id">Location ID:</label>
                    <input type="text" id="location_id" name="location_id" placeholder="e.g. Iron Mountain" />
                </div>

                <div className="form-field">
                    <label htmlFor="vehicle_id">Vehicle:</label>
                    <select id="vehicle_id" name="vehicle_id">
                        <option value="">Select a vehicle...</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.title}</option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="competition"><span className="required">*</span>Competition?</label>
                    <select id="competition" name="competition" required>
                        <option value="">Select...</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                </div>

                {error && <p className="error-text">{error}</p>}

                <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Confirm Upload'}
                </button>
            </form>
        </div>
    )
}

function UploadDataset() {
    const [step, setStep] = useState('upload')
    const [tempId, setTempId] = useState(null)
    const [datasetId, setDatasetId] = useState(null)

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
                    &larr; Home
                </button>
                <h1 style={{ margin: 0, fontSize: '24px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    Upload a Dataset
                </h1>
                <div></div>
            </header>

            <div style={{ marginTop: '100px', padding: '20px', maxWidth: '600px', margin: '100px auto 0' }}>
                <StepIndicator current={step} />

                {step === 'upload' && (
                    <UploadStep onComplete={(id) => {
                        setTempId(id)
                        setStep('validate')
                    }} />
                )}

                {step === 'validate' && (
                    <ValidateStep
                        tempId={tempId}
                        onComplete={() => setStep('metadata')}
                    />
                )}

                {step === 'metadata' && (
                    <MetadataStep
                        tempId={tempId}
                        onComplete={(id) => {
                            setDatasetId(id)
                            setStep('done')
                        }}
                    />
                )}

                {step === 'done' && (
                    <div className="done-step">
                        <h2>Upload Complete</h2>
                        <p>Dataset ID: {datasetId}</p>
                        <a href={`/dataset/${datasetId}`}>View Dataset</a>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UploadDataset
