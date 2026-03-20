import { useState, useEffect } from	'react'
import { api } from	'../api/backend'
import { useParams } from 'react-router'
import Plot	from 'react-plotly.js'

function DatasetGraph()	{
	const {	id } = useParams();
	const [sensors, setSensors] = useState(null)
	const [data, setData] =	useState(null)

	// Graph traces
	const [traces, setTraces] = useState(null)
	const [loaded, setLoaded] =	useState(false)
	const [initialTime,	setInitialTime]	= useState(0);

	useEffect(() =>	{
		api.getDatasetData(id)
			.then((blob) =>	blob.text())
			.then((rawData)	=> JSON.parse(rawData))
			.then((dataJSON) =>	{
				// Take only every 100th data point at the moment. Need to figure out different data granularities for different zoom levels
				const DESIRED_POINTS = 5000
				let filterRate = Math.round(dataJSON.length / DESIRED_POINTS)
				filterRate = filterRate > 1 ? filterRate : 1;
				let	filteredData = dataJSON.filter((elem, i) =>	i %	filterRate == 0)
				console.log(filteredData)
				let allSensors = Array.from(new Set(dataJSON.flatMap(Object.keys)))
				const EXCLUDED = new Set(["microsec", "sec"])
				const sensors = allSensors.filter(key => !EXCLUDED.has(key))
				const initialTime = ('sec' in dataJSON[0] ? dataJSON[0].sec : 0) + ('microsec' in dataJSON[0] ? dataJSON[0].microsec / 1e6 : 0)
				console.log(initialTime)
				const traces = sensors.map(sensor => ({
					name: sensor,
					visible: 'legendonly',
					x: filteredData.filter(d => sensor in d).map(d => (('sec' in d ? d['sec'] : 0) + ('microsec' in d ? d['microsec'] / 1e6 : 0) - initialTime)),
					y: filteredData.filter(d => sensor in d).map(d => d[sensor]),
					type: 'scatter',
					mode: 'lines+markers',
				}));
				traces[0].visible = true
				setTraces(traces)
				console.log(traces)

				setData(filteredData);
				setLoaded(true);
			})
	}, []);

	return (
		<>
			{ loaded ? (
				<Plot
					data={traces}
					layout={ {width: 1200, height: 800,	title: {text: 'A Fancy Plot'}} }
				  />
				) : (
					<h1> Loading data... </h1>
				)
			}
		</>
	)
}

export default DatasetGraph

