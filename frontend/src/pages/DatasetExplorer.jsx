import {useState, useEffect} from 'react'
import { api } from	'../api/backend.js'
import { Link }	from 'react-router'
import './DatasetExplorer.css'

function DatasetExplorer() {
	const [datasetSummaries, setDatasetSummaries] =	useState(null)
	const [datasetsLoaded, setDatasetsLoaded] =	useState(false)
	const [openDropdown, setOpenDropdown] =	useState(null)

	// Fetch datasets from server
	useEffect(() =>	{
		api.getDatasets()
			.then((data) =>	{
				setDatasetSummaries(data)
				setDatasetsLoaded(true)
			})
			.catch(err => console.error(`Error fetching	datasets: ${err}`));
	}, [])

// UI
	return (
		<>
			{ datasetsLoaded ? (
				<div className="explorer">
					{datasetSummaries.map(summary =>
						<div key={summary.id} className="dataset-blk">
							<span className="main-info">
								<Link to={`/dataset/${summary.id}`}	className="dataset-title">{summary.title}</Link>
								<h4	className="date">{summary.date}</h4>
							</span>
							<p>
								{summary.description}
							</p>
							<span className="toolbar">
								<button	onClick={()	=> api.downloadDataset(summary.id)}>Download</button>
							</span>
						</div>
					)}
				</div>
			) :	(
				<h1> Loading datasets... </h1>
			)}
		</>
	)
}

export default DatasetExplorer
