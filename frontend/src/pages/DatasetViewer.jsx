import { useState, useEffect } from 'react'
import { api } from '../api/backend.js'
import { useParams } from 'react-router'

function DatasetViewer () {
	const { id } = useParams()
	const [dataset, setDataset] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		api.getDatasetByID(id)
			.then(dataset => {
				setDataset(dataset);
				setLoading(false);
			})
			.catch(err => console.error(`Error when fetching dataset ${id}: ${err}`));
	}, [])

	return (
		<>
			{loading ? (
				<h1> Loading details... </h1>
			) : (
				<div className="dataset-info">
					<div className="headline">
						<h1> {dataset.title} </h1>
					</div>

					<div className="info">
						<p> Date: {dataset.date} </p>
						<p> Updated: {dataset.updated_at} </p>
					</div>

					<div className="description">
						<p> {dataset.description} </p>
					</div>

					<div className="toolbar">
						<button onClick={() => api.downloadDataset(dataset.id, async () => api.getDatasetData(dataset.id))}> Download JSON</button>
						<button onClick={() => api.downloadDataset(dataset.id, async () => api.getDatasetDataCSV(dataset.id))}> Download CSV </button>
						<a href={`/dataset/graph/${id}`}> <button> View Graph </button> </a>
					</div>
				</div>
			)}
		</>
	)
}

export default DatasetViewer
