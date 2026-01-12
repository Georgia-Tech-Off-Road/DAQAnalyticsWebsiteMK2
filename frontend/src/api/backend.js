const API_BASE = `http://127.0.0.1:3000`

// Vehicles
const GET_VEHICLES_URL = `${API_BASE}/vehicles`

// Datasets
const GET_DATASETS_URL = `${API_BASE}/datasets/`
const UPLOAD_DATASET_URL = `${API_BASE}/datasets/upload`
const GET_DATA_URL = `${API_BASE}/datasets/data/`


async function getDatasetByID(id) {
	const res = await fetch(`${GET_DATASETS_URL}${id}`)
	if (!res.ok) throw new Error(`Failed to fetch dataset with ${id}`)
	return res.json();
}
export const api = {
// Vehicles
	async getVehicles() {
		const res = await fetch(GET_VEHICLES_URL)
		const vehicles = await res.json()
		return vehicles
	},

// Datasets
	async getDatasets() {
		const res = await fetch(GET_DATASETS_URL)
		const datasets = await res.json()
		return datasets
	},

	getDatasetByID,

	async uploadDataset(form_data) {
		const res = await fetch(UPLOAD_DATASET_URL, {
			method: 'POST',
			body: form_data
		});
		if (!res.ok) throw new Error('Upload Failed')

		return res.json()
	},

	async downloadDataset(id) {
		// TODO: Make it so that datafile and dataset are fetched concurrently
		const res = await fetch(GET_DATA_URL)
		const dataset = await getDatasetByID(id)
		
		if (!res.ok) {
			throw new Error(`Failed to retrieve data file corresponding to the dataset with id: ${id}`)
		}

		const blob = await res.blob()

		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = dataset.title
		document.body.appendChild(a)
		a.click()

		// Cleanup
		window.URL.revokeObjectURL(url)
		document.body.removeChild(a)
	}
}


