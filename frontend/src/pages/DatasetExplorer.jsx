import {useState, useEffect} from 'react'
import { api } from	'../api/backend.js'
import { Link } from 'react-router'


function DatasetExplorer() {
	const [datasetSummaries, setDatasetSummaries] =	useState(null)
	const [datasetsLoaded, setDatasetsLoaded] =	useState(false)

	useEffect(() =>	{
		api.getDatasets()
			.then((data) => {
				setDatasetSummaries(data)
				setDatasetsLoaded(true)
			})
			.catch(err => console.error(`Error fetching	datasets: ${err}`));
	}, [])

// UI
	return (
		<>
			{ datasetsLoaded ? (
				<ul>
					{datasetSummaries.map(summary =>
						<li	key={summary.id}>
							<Link to={`/dataset/${summary.id}`}>{summary.title}</Link>
						</li>
					)}
				</ul>
			) : (
				<h1> Loading datasets... </h1>
			)}
		</>
	)
}

export default DatasetExplorer
