import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)

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
        <button onClick={async () => {
          setLoading(true)
          try {
            // Call backend directly. Backend listens on 127.0.0.1:3000
            const res = await fetch('http://127.0.0.1:3000/data')
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

        {/* Show loading state or file contents */}
        {loading && <p>Loading...</p>}
        {!loading && fileData && (
          <pre style={{whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto'}}>{fileData}</pre>
        )}
       
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
