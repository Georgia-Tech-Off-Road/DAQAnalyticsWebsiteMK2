import { useState, useEffect } from 'react'
import { api } from '../api/backend.js'

async function handleDeleteDataset(datasetID, setDatasets) {
	if (window.confirm('Are you sure you want to delete this dataset?')) {
		const res = await api.deleteDataset(datasetID)
		if (res.error) {
			window.alert(`Error deleting dataset ${datasetID}: ${res.error}`)
		} else {
			window.alert(`Dataset ${datasetID} deleted successfully`)
			// Force the page to refetch all datasets from backend
			setDatasets([])
		}
	}
}

async function handleDeleteLocation(locationID, setLocations) {
	if (window.confirm('Are you sure you want to delete this location?')) {
		try {
			await api.deleteLocation(locationID)
			window.alert(`Location ${locationID} deleted successfully`)
			setLocations([])
		} catch (err) {
			window.alert(`Error deleting location ${locationID}: ${err.message}`)
		}
	}
}

function DatasetManager() {
	const [datasets, setDatasets] = useState([])
	const [locations, setLocations] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		Promise.all([api.getDatasets(), api.getLocations()])
			.then(([datasets, locations]) => {
				setDatasets(datasets)
				setLocations(locations)
				setLoading(false)
			})
			.catch(err => console.error(`Error when fetching data: ${err}`));
	}, [datasets, locations]);

	if (loading) {
		return <div className="manager-table">Loading...</div>
	}

	const datasetRows = datasets.map(dataset => (
			<tr key={dataset.id}>
				<th scope="row"> {dataset.title} </th>
				<th>
					<button onClick={async () => handleDeleteDataset(dataset.id, setDatasets)}>
						Delete
					</button>
				</th>
			</tr>
		)
	)

	const locationRows = locations.map(location => (
			<tr key={location.id}>
				<th scope="row"> {location.title} </th>
				<th>
					<button onClick={async () => handleDeleteLocation(location.id, setLocations)}>
						Delete
					</button>
				</th>
			</tr>
		)
	)

	return (
		<div className="manager-table">
			<h2>Datasets</h2>
			{datasets.length === 0 ? <p>No datasets found...</p> : (
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
			)}

			<h2>Locations</h2>
			{locations.length === 0 ? <p>No locations found...</p> : (
				<table>
					<thead>
						<tr>
							<th scope="col"> Location Name </th>
							<th scope="col"> Delete </th>
						</tr>
					</thead>
					<tbody>
						{locationRows}
					</tbody>
				</table>
			)}
		</div>
	)
}

export default DatasetManager;
