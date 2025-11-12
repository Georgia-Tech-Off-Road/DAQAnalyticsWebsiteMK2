import React, { useRef, useState } from 'react'

function UploadPage({ onUploadSuccess } = {}) {
  const fileInputRef = useRef()
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)

  return (
    <div>
      <form onSubmit={async (e) => {
        e.preventDefault()
        const files = fileInputRef.current?.files
        if (!files || files.length === 0) {
          setFileData('Please select a file')
          return
        }
        const fd = new FormData()
        fd.append('file', files[0]) // must match upload.single('file')

        setLoading(true)
        try {
          const res = await fetch('http://127.0.0.1:3000/datasets/upload', { method: 'POST', body: fd })
          if (!res.ok) throw new Error('Upload failed: ' + res.status)
          const json = await res.json()
          setFileData('Upload success: ' + JSON.stringify(json))
          // notify parent so it can refresh file lists
          if (typeof onUploadSuccess === 'function') onUploadSuccess(json)
        } catch (err) {
          setFileData('Upload error: ' + err.message)
        } finally {
          setLoading(false)
          alert('File finished uploading')
        }
      }}>
        <label htmlFor="myFile">Choose File:</label>
        <input ref={fileInputRef} type="file" id="myFile" name="file" accept=".txt,.json" />
        <button className="logo" type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
        
        
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