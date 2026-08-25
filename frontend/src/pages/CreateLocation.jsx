import { useState } from "react"
import { api } from '../api/backend'
import './CreateLocation.css'

import '../components/DatasetLocationSelector/DatasetLocationSelector.jsx'

import * as urls from '../urls.js'
import DatasetLocationSelector from "../components/DatasetLocationSelector/DatasetLocationSelector.jsx"

export default function CreateLocation() {

	const [selectedLocation, setSelectedLocation] = useState(null)
	const [locationName, setLocationName] = useState("")
	const [locationDescription, setLocationDescription] = useState("")
	const [isCompetition, setIsCompetition] = useState("")
	function handleSelect(loc) {
		setSelectedLocation(loc)
	}

	return (
		<div className="admin-form" >
			<div className="form-banner">
				<h2 className="form-title"> Create Location </h2>
			</div>

			<div style={{ width: '100%' }} className="form-body">
				<div className="form-field">
					<label htmlFor="location_name"> Name: </label>
					<input
						name="location_name"
						type="text"
						value={locationName}
						defaultValue="GA Tech"
						onChange={(e) => setLocationName(e.target.value)}
					/>
				</div>

				<div className="form-field">
					<label htmlFor="location_description"> Description </label>
					<input
						name="location_description"
						type="text"
						value={locationDescription}
						defaultValue="e.g beautiful campus"
						onChange={(e) => setLocationDescription(e.target.value)}
					/>
				</div>

				<div className="form-field">
					<label htmlFor="location_competition"> Competition? </label>
					<select
						name="location_competition"
						value={isCompetition}
						onChange={(e) => setIsCompetition(e.target.value)}
					>
						<option value=""> Select... </option>
						<option value="1"> Yes </option>
						<option value="0"> No </option>
					</select>
				</div>
				<div className="map-container">
					<DatasetLocationSelector
						isCreateLocation={true}
						onSelect={handleSelect}
						createName={locationName}
					/>
				</div>
			</div>
		</div>
	)
}

