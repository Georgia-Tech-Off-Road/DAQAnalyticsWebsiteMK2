import { useState, useEffect } from 'react'
import { api } from '../api/backend.js'

async function handleDelete(datasetID, setDatasets) {
	if (window.confirm('Are you sure you want to delete this dataset?')) {
		const res = await api.deleteDataset(datasetID)
		if (res.status != 200) {
			window.alert(`Dataset ${datasetID} deleted successfully`)
			// Force to page to refetch all datasets from backend
			setDatasets([])
		} else {
			widow.alert(`Error deleting dataset ${datasetID}: ${res.error}`)
		}
	}
}

function DatasetManager() {
	const [datasets, setDatasets] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		api.getDatasets()
			.then(datasets => {
				setDatasets(datasets)
				setLoading(false)
			})
			.catch(err => console.error(`Error when fetching datasets: ${err}`));
	}, []);

	if (loading) {
		return <div className="manager-table">Loading datasets...</div>
	}

	if (datasets.length === 0) {
		return <div className="manager-table">No datasets found...</div>
	}

	const datasetRows = datasets.map(dataset => (
			<tr key={dataset.id}>
				<th scope="row"> {dataset.title} </th>
				<th>
					<button onClick={async () => handleDelete(dataset.id, setDatasets)}>
						Delete
					</button>
				</th>
			</tr>
		)
	)

	return (
		<div className="manager-table">
			<table>
				<thead>
					<tr>
						<th scope="col"> Dataset Name </th>
						<th scope="col"> Delete </th>
					</tr>
				</thead>
				<tbody>
					{datasetRows}
				</tbody>
			</table>
		</div>
	)
}

export default DatasetManager;
