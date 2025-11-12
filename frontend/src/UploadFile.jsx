import React, { useRef, useState } from 'react'

function UploadPage() {
    const fileInputRef = useRef(null)
    const formRef = useRef(null)
    const buttonRef = useRef(null);
    const [fileData, setFileData] = useState(null)
    const [loading, setLoading] = useState(false)

    return (
        <div>
            <form ref={formRef} onSubmit={async (e) => {
                e.preventDefault() // CRITICAL: Prevent default form submission

                console.log('Form submitted')

                const files = fileInputRef.current?.files
                if (!files || files.length === 0) {
                    setFileData('Please select a file')
                    return
                }

                const fd = new FormData(formRef.current)

                // Debug: log what we're sending
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
                        // DO NOT set Content-Type header - browser sets it automatically with boundary
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
                <label htmlFor="myFile">Choose File:</label>
                <input ref={fileInputRef} type="file" id="myFile" name="file" accept=".txt,.json"/>

                <div> Title: <input type="text" id="myTitle" name="title" required/> </div>
                <div> Description: <input type="text" id="myDesc" name="description"/> </div>
                <div> Date: <input type="date" id="myDate" name="date" required/> </div>
                <div> Location ID: <input type="text" id="myLocation" name="location_id"/> </div>
                <div> Was this data from a competition? <input type="checkbox" id="compCheck" name="competition"/> </div>

                <button ref={buttonRef} className="logo" type="submit"
                        disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
            </form>

            {fileData && (
                <div style={{ marginTop: 12 }}>
                    <strong>Result:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{fileData}</pre>
                </div>
            )}
        </div>
    )
}

export default UploadPage