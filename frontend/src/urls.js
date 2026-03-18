export function home() {
    return '/'
}

export function test(text) {
    return `/test/${text}`
}

export function uploadFile() {
    return '/UploadFile'
}

export function uploadDataset() {
    return '/UploadDataset'
}

export function uploadVehicle() {
    return '/UploadVehicle'
}

export function viewVehicles() {
    return '/ViewVehicles'
}

export function datasetExplorer() {
    return '/DatasetExplorer'
}

export function dataset(id) {
    return `/dataset/${id}`
}

export function datasetGraph(id) {
    return `/dataset/graph/${id}`
}

export function login() {
	return localLogin()
}

export function localLogin() {
    return '/login/local'
}


export function manager() {
    return '/manager'
}

// Error Pages
export function authErrorPage() {
	return '/error/auth-error'
}
