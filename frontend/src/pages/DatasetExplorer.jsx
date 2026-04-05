import {useState, useEffect} from 'react'
import { api } from	'../api/backend.js'
import { Link }	from 'react-router'
import './DatasetExplorer.css'
import * as urls from '../urls.js'

function DatasetExplorer() {
	const [datasetSummaries, setDatasetSummaries] =	useState(null)
	const [datasetsLoaded, setDatasetsLoaded] =	useState(false)
	const [input, setInput] = useState('')
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
				<>
					<div className="search-bar">
							<label for="dataset-search"> Search: </label>
							<input type="text" id="dataset-search" placeholder="06-04-2026" value={input} onChange={(e) => setInput(e.target.value)}></input>
							<button className="button" onClick={onSearchDataset}> Search </button>
					</div>
					{ datasetSummaries.length > 0 ? (
						<>
							<div className="explorer">
								{datasetSummaries.map(summary =>
									<div key={summary.id} className="dataset-blk">
										<span className="main-info">
											<Link to={urls.dataset(summary.id)}	className="dataset-title">{summary.title}</Link>
											<h4	className="date">{summary.date}</h4>
										</span>
										<p>
											{summary.description}
										</p>
										<span className="toolbar">
											<button	onClick={()	=> api.downloadDataset(summary.id, async () => api.getDatasetData(summary.id))}>Download</button>
										</span>
									</div>
								)}
							</div>
						</>
					) : (
						<h3> No datasets found </h3>
					)}
				</>
			) : (
				<h1> Loading datasets... </h1>
			)}
		</>
	)

	function onSearchDataset() {
		api.getDatasets(input)
			.then((data) =>	{
				setDatasetSummaries(data)
				setDatasetsLoaded(true)
			})
			.catch(err => console.error(`Error fetching	datasets: ${err}`));
	}
}


export default DatasetExplorer
