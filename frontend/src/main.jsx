import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import App from './App.jsx'
import Test from "./Test.jsx"
import UploadPage from "./UploadFile.jsx"
import Home from "./Home.jsx"
import VehiclePage from "./VehicleSystems/UploadVehicle.jsx"
import VehicleView from "./VehicleSystems/ViewVehicles.jsx"
import DatasetExplorer from "./pages/DatasetExplorer.jsx"
import DatasetViewer from "./pages/DatasetViewer.jsx"

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/test/:text" element={<Test />} />
                <Route path="/UploadFile" element={<UploadPage />} />
                <Route path="/UploadVehicle" element={<VehiclePage />} />
                <Route path="/ViewVehicles" element={<VehicleView />} />
                <Route path="/DatasetExplorer" element={<DatasetExplorer />} />
                <Route path="/dataset/:id" element={<DatasetViewer />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
)
