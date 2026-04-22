const API_BASE = import.meta.env.VITE_BACKEND_URL

// Vehicles
const GET_VEHICLES_URL = `${API_BASE}/vehicles`

// Locations
const GET_LOCATIONS_URL = `${API_BASE}/locations`

// Datasets
const GET_DATASETS_URL = `${API_BASE}/datasets`
const UPLOAD_DATASET_URL = `${API_BASE}/datasets/upload`
const DOWNLOAD_DATA_URL = `${API_BASE}/datasets/download`
const UPLOAD_TEMP_URL = `${API_BASE}/datasets/upload`
const VALIDATE_URL = `${API_BASE}/datasets/validate`
const CONFIRM_URL = `${API_BASE}/datasets/upload/confirm`
const DELETE_DATASET_URL = `${API_BASE}/datasets/delete`

// Auth
const LOCAL_LOGIN_URL = `${API_BASE}/auth/local/login`
const SSO_LOGIN_URL = `${API_BASED}/auth/saml/login`
const SESSION_URL = `${API_BASE}/auth/session`
const LOGOUT_URL = `${API_BASE}/auth/logout`

async function getDatasetByID(id) {
	const res = await fetch(`${`${API_BASE}/datasets/`}${id}`, { credentials: 'include' })
	if (!res.ok) throw new Error(`Failed to fetch dataset with ${id}`)
	return res.json();
}

export const api = {
// Vehicles
	async getVehicles() {
		const res = await fetch(GET_VEHICLES_URL, { credentials: 'include' })
		const vehicles = await res.json()
		return vehicles
	},
// Locations
	async getLocations() {
		const res = await fetch(GET_LOCATIONS_URL, { credentials: 'include' })
		const locations = await res.json()
		return locations
	},

// Datasets
	async getDatasets(search = "") {
		const url = search ? `${GET_DATASETS_URL}/?search=${encodeURIComponent(search)}` : GET_DATASETS_URL
		const res = await fetch(url, { credentials: 'include' })
		const datasets = await res.json()
		return datasets
	},
	getDatasetByID,
	async uploadDataset(form_data) {
		const res = await fetch(UPLOAD_DATASET_URL, {
			method: 'POST',
			credentials: 'include',
			body: form_data
		});
		if (!res.ok) throw new Error('Upload Failed')

		return res.json()
	},

	async deleteDataset(id) {
		const res = await fetch(`${DELETE_DATASET_URL}/${id}`, {
			method: 'DELETE',
			credentials: 'include',
		});
		return res.json()
	},

	async uploadTemp(file) {
		const fd = new FormData()
		fd.append('file', file)
		const res = await fetch(UPLOAD_TEMP_URL, {
			method: 'POST',
			credentials: 'include',
			body: fd
		})
		if (!res.ok) throw new Error('Upload failed')
		return res.json()
	},

	async validateTemp(tempId) {
		const res = await fetch(`${VALIDATE_URL}/${tempId}`, {
			method: 'POST',
			credentials: 'include'
		})
		if (!res.ok) throw new Error('Validation failed')
		return res.json()
	},

	async confirmUpload(data) {
		const res = await fetch(CONFIRM_URL, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
		if (!res.ok) {
			let body = await res.json()
			throw new Error(`Confirm failed: ${body.error}`)
		}
		return res.json()
	},
	// Gets the raw JSON data from the dataset
	async getDatasetData(id) {
		const res = await fetch(`${DOWNLOAD_DATA_URL}/${id}`, { credentials: 'include' })

		if (!res.ok) {
			throw new Error(`error: failed to retrieve data from dataset with id: ${id}`)
		}

		return await res.blob();
	},

	// Gets the data from the dataset in .csv format
	async getDatasetDataCSV(id) {
		const res = await fetch(`${DOWNLOAD_DATA_URL}/csv/${id}`, { credentials: 'include' })

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
	},

	// Authentication
	async loginLocal(username, password) {
		const res = await fetch(LOCAL_LOGIN_URL, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
		})
		const data = res.ok ? await res.json() : null
		return { ok: res.ok, status: res.status, data }
	},

	async SSOLogin() {
		const res = await fetch(SSO_LOGIN_URL, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
		})

		return { ok: res.ok, status: res.status }
	},

	async getSession() {
		const res = await fetch(SESSION_URL, { credentials: 'include' })
		if (!res.ok) return null
		return res.json()
	},

	async logout() {
		const res = await fetch(LOGOUT_URL, {
			method: 'POST',
			credentials: 'include'
		})
		return res.ok
	}
}
