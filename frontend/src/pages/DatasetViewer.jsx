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
				<h1> {dataset.title} </h1>
			)}
		</>
	)
}

export default DatasetViewer
