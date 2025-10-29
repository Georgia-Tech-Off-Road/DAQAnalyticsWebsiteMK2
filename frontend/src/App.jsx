import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    loadFileNames()
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
        
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
          display file
        </button>
       
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )

  function populateSelect(selectId, fileArray) {
    const selectElement = document.getElementById(selectId);

    while (selectElement.children.length > 1) {
      selectElement.removeChild(selectElement.lastchild)
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

  async function loadFileNames() {
    
    try {
      const res = await fetch('http://127.0.0.1:3000/listFiles/')
            
      if (!res.ok) throw new Error('failed to fetch files')

      const files = await res.json()

      populateSelect('fileDisplay', files)
    } catch (err) {
      console.error('Error:', err)
      setFileData('Error loading files: ' + err.message)
    } finally {
    }
  }
}

export default App
