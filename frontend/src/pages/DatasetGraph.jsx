import { useState, useEffect } from	'react'
import { api } from	'../api/backend'
import { useParams } from 'react-router'
import Plot	from 'react-plotly.js'

function DatasetGraph()	{
	const {	id } = useParams();
	const [data, setData] =	useState(null)
	const [loaded, setLoaded] =	useState(false)
	const [initialTime,	setInitialTime]	= useState(0);

	useEffect(() =>	{
		api.getDatasetData(id)
			.then((blob) =>	blob.text())
			.then((rawData)	=> JSON.parse(rawData))
			.then((dataJSON) =>	{
				// Take only every 100th data point at the moment. Need to figure out different data granularities for different zoom levels
				let	filteredData = dataJSON.filter((elem, i) =>	i %	100 == 0)
				setData(filteredData);
				setInitialTime(filteredData[0].sec);
				setLoaded(true);
				console.log(filteredData);
			})
	}, []);

	return (
		<>
			{ loaded ? (
				<Plot
					data={[
					  {
						x: data.map((elem) => elem.sec - initialTime),
						y: data.map((elem) => elem.RearBrakePressure),
						type: 'scatter',
						mode: 'lines+markers',
						marker:	{color:	'red'},
					  },
					  {type: 'bar',	x: [1, 2, 3], y: [2, 5,	3]},
					]}
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

