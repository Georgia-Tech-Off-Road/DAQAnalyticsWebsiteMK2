import { useState, useEffect } from "react"
import DataSetAccess from "./components/DataSetAccess"


function DataSetExplorer() {

    const [datasets, setDataSets] = useState([])
    const [loadingDataSets, setLoadingDataSet] = useState(true)
    useEffect(() => {
        loadFileNames()
    }, []);
    
    let alertMessage = null;

    if (loadingDataSets) {
        alertMessage = ( <p> "Loading datasets..." </p> )
    }

    return (
        <>
            { alertMessage }
            <DataSetAccess title="My Dataset 1" date="11-03-2025"/>
        </>
    )

    async function loadFileNames() {
        try {
            const res = await fetch('http://127.0.0.1:3000/listFiles/')
            
            if (!res.ok) throw new Error('failed to fetch files')

            setDataSets(await res.json())
            setLoadingDataSet(false)

        } catch (err) {
            console.log("Error loading files");
        }
    }
}

export default DataSetExplorer