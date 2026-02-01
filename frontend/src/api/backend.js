const API_BASE = `http://127.0.0.1:3000`

// Vehicles
const GET_VEHICLES_URL = `${API_BASE}/vehicles`

// Datasets
const GET_DATASETS_URL = `${API_BASE}/datasets/`
const UPLOAD_DATASET_URL = `${API_BASE}/datasets/upload`
const DOWNLOAD_DATA_URL = `${API_BASE}/datasets/download`

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
	// Gets the raw JSON data from the dataset
	async getDatasetData(id) {
		const res = await fetch(`${DOWNLOAD_DATA_URL}/${id}`)

		if (!res.ok) {
			throw new Error(`error: failed to retrieve data from dataset with id: ${id}`)
		}

		return await res.blob();
	},

	// Gets the data from the dataset in .csv format
	async getDatasetDataCSV(id) {
		const res = await fetch(`${DOWNLOAD_DATA_URL}/csv/${id}`)

		if(!res.ok) {
			throw new Error(`error: failed to retrieve .csv data  from dataset with id: ${id}`)
		}

		return await res.blob();
	},

	// Downloads a dataset, given a function that fetches the data
	async downloadDataset(id, getDataFunc) {
		// Get metadata
		const dataset = await getDatasetByID(id);

		// Retrieve data by given function
		const blob = await getDataFunc();

		// Create temporary URL
		const url = window.URL.createObjectURL(blob)

		// Create invisible link
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
