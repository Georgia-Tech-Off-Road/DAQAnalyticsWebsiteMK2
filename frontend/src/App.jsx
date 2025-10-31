import { useState,useEffect,useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    loadFileNames()
  }, []);

  return (
    <>
      
      <div>
        <form onSubmit={async (e) => {
          e.preventDefault()
          const files = fileInputRef.current.files
          if (!files || files.length === 0) {
            setFileData('Please select a file')
            return
          }
          const fd = new FormData()
          fd.append('file', files[0]) // field name must match upload.single('file')
          setLoading(true)
          try {
            const res = await fetch('http://127.0.0.1:3000/upload', { method: 'POST', body: fd })
            if (!res.ok) throw new Error('Upload failed: ' + res.status)
            const json = await res.json()
            setFileData('Upload success: ' + JSON.stringify(json))
            // optionally refresh file list here
            loadFileNames()
          } catch (err) {
            setFileData('Upload error: ' + err.message)
          } finally {
            setLoading(false)
            alert("File finish uploading")
            loadFileNames()
          }
        }}>
          <label htmlFor="myFile">Choose File:</label>
          <input ref={fileInputRef} type="file" id="myFile" name="file" accept=".txt,.json" />
          <button class="logo" type="submit">Upload</button>
        </form>
      </div>


      <div className="card">
        <label for="fileDisplay">Select a file to display:</label>
          <select id="fileDisplay" name="fileDisplay">
            <option value = "" disabled selected>Select a file</option>
          </select>


        {/* Show loading state or file contents */}
        {loading && <p>Loading...</p>}
        {!loading && fileData && (
          <pre style={{whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto'}}>{fileData}</pre>
        )}

        
          <button onClick={async () => {
          setLoading(true)
          try {
            // Call backend directly. Backend listens on 127.0.0.1:3000
            const res = await fetch(getSelectedValue())
            const text = await res.text()
            setFileData(text)
          } catch (err) {
            setFileData('Error fetching data: ' + err.message)
          } finally {
            setLoading(false)
          }
        }}>
          Display file
        </button>
       
      </div>

      <div>
        <label for="fileDownload">Select a file to downlaod:</label>
          <select id="fileDownload" name="fileDownloadS">
            <option value = "" disabled selected>Select a file</option>
          </select>

          <button onClick={async () => {
            const dropdown = document.getElementById("fileDownload")
            const fileName = dropdown.value
            if (!fileName) {
                setFileData('Please select a file to download')
                return
            }
            
            setLoading(true)
            try {
                // Call backend directly. Backend listens on 127.0.0.1:3000
                const res = await fetch(getSelectedDLValue())
                if (!res.ok) throw new Error('Download failed: ' + res.status)
                
                // Get the blob from the response
                const blob = await res.blob()
                
                // Create a temporary link and trigger download
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = fileName  // Suggest filename to save as
                document.body.appendChild(a)
                a.click()
                
                // Cleanup
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } catch (err) {
                setFileData('Error downloading file: ' + err.message)
            } finally {
                setLoading(false)
            }
          }}>
            Download file
          </button>
      </div>
    </>
  )

  function populateSelect(selectId, fileArray) {
    const selectElement = document.getElementById(selectId);

    while (selectElement.children.length > 1) {
      selectElement.removeChild(selectElement.lastChild)
    }

    fileArray.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });
  }


  function getSelectedValue() {
    const dropdown = document.getElementById("fileDisplay");
    const selectedValue = dropdown.value;
    
    const result = 'http://127.0.0.1:3000/data/' + selectedValue
    console.log(result)
    return result
  }

  function getSelectedDLValue() {
    const dropdown = document.getElementById("fileDownload");
    const selectedValue = dropdown.value;
    
    const result = 'http://127.0.0.1:3000/download/' + selectedValue
    console.log(result)
    return result
  }

  async function loadFileNames() {
    
    try {
      const res = await fetch('http://127.0.0.1:3000/listFiles/')
            
      if (!res.ok) throw new Error('failed to fetch files')

      const files = await res.json()

      populateSelect('fileDisplay', files)
      populateSelect('fileDownload', files)
    } catch (err) {
      console.error('Error:', err)
      setFileData('Error loading files: ' + err.message)
    } finally {
    }
  }
}

export default App
