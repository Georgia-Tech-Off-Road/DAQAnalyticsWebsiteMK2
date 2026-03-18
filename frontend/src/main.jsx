import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import * as urls from './urls.js'
import App from './App.jsx'
import Test from "./Test.jsx"
import UploadPage from "./UploadFile.jsx"
import Home from "./Home.jsx"
import VehiclePage from "./VehicleSystems/UploadVehicle.jsx"
import VehicleView from "./VehicleSystems/ViewVehicles.jsx"
import DatasetExplorer from "./pages/DatasetExplorer.jsx"
import DatasetViewer from "./pages/DatasetViewer.jsx"
import DatasetGraph from "./pages/DatasetGraph.jsx"
import UploadDataset from "./pages/UploadDataset.jsx"
import LocalLogin from "./pages/LocalLogin.jsx"
import DatasetManager from "./pages/DatasetManager.jsx"

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path={urls.home()} element={<Home />} />
                <Route path="/test/:text" element={<Test />} />
                <Route path={urls.uploadFile()} element={<UploadPage />} />
                <Route path={urls.uploadDataset()} element={<UploadDataset />} />
                <Route path={urls.uploadVehicle()} element={<VehiclePage />} />
                <Route path={urls.viewVehicles()} element={<VehicleView />} />
                <Route path={urls.datasetExplorer()} element={<DatasetExplorer />} />
                <Route path="/dataset/:id" element={<DatasetViewer />} />
                <Route path="/dataset/graph/:id" element={<DatasetGraph />} />
                <Route path={urls.localLogin()} element={<LocalLogin />} />
                <Route path={urls.manager()} element={<DatasetManager />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>,
)
