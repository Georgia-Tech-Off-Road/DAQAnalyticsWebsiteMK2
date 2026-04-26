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

import Login from "./pages/Login.jsx"
import LocalLogin from "./pages/LocalLogin.jsx"

import DatasetManager from "./pages/DatasetManager.jsx"
import AuthErrorPage from "./pages/errorPages/AuthErrorPage.jsx"

// Library Functions
import AuthRequired from "./lib/AuthRequired.jsx"

const datasetExplorer = <AuthRequired> <DatasetExplorer /> </AuthRequired>
const datasetViewer = <AuthRequired> <DatasetViewer /> </AuthRequired>
const datasetGraph = <AuthRequired> <DatasetGraph /> </AuthRequired>
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
                <Route path={urls.datasetExplorer()} element={datasetExplorer} />
                <Route path="/dataset/:id" element={datasetViewer} />
                <Route path="/dataset/graph/:id" element={datasetGraph} />
                <Route path={urls.login()} element={<Login />} />
                <Route path={urls.localLogin()} element={<LocalLogin />} />
                <Route path={urls.manager()} element={<DatasetManager />} />

       			# Error pages

       			<Route path={urls.authErrorPage()} element={<AuthErrorPage />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
)
