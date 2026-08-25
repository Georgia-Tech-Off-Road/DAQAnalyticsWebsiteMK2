import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet'
import { api } from '../../api/backend.js'
import 'leaflet/dist/leaflet.css'

const SCC_COORDS = [33.787070543013535, -84.40668157426596]
const DEFAULT_MAP_ZOOM = 10
const DEFAULT_RADIUS= 5000

export default function DatasetLocationSelector({ isCreateLocation, createName, onSelect}) {
	const [locations, setLocations] = useState([])
	const [selectedID, setSelectedID] = useState(null)

	useEffect(() => {
		api.getLocations().then((locs) => {
			setLocations(locs)
		})
	}, [])

	const locationsByID = Object.fromEntries(locations.map(l => [l.id, l]))

	const selectedPath = (selectedID !== null || (isCreateLocation && createName !== null)) ? `${calculateLocationPath(selectedID, locationsByID)}${isCreateLocation ? `${createName}` : ""}` : "Please select a location..."
	const viewableLocations = locations.filter((loc) => loc.parent_id == selectedID)
	const locationMarkers = viewableLocations.map(loc => {
		return (
			<Circle
				key={loc.id}
				center={[loc.latitude, loc.longitude]}
				radius={DEFAULT_RADIUS}
				eventHandlers={{ click: () => handleSelect(loc) }}
			>
				<Popup>{loc.title}</Popup>
			</Circle>
		)
	})

	function handleSelect(loc) {
		setSelectedID(loc.id)
		onSelect(loc)
	}
	// const locationPins = viewableLocations.map()
	return (
		<>
			<MapContainer center={SCC_COORDS} zoom={DEFAULT_MAP_ZOOM} style={{height: '60vh', width: 'max(100%, 60vw)'}}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		        />
		        {locationMarkers}
			</MapContainer>
			<span class="info-footer">
				<button onClick={() => handleBackClick()}> Back </button>
				<h3> {isCreateLocation ? "Location" : "Selected Location"}: {selectedPath} </h3>
			</span>
		</>
	)

	function handleBackClick() {
		const currLocationID = locationsByID[selectedID]
		setSelectedID(currLocationID.parent_id)
	}
}

function calculateLocationPath(locationID, locationsByID) {
	if (locationID === null) return ""

	let path = ""
	let location = locationsByID[locationID]

	while (location.parent_id !== null) {
		path = `${location.title}>${path}`
		location = locationsByID[location.parent_id]
	}
	// Add last location
	path = `${location.title}>${path}`

	return path
}
