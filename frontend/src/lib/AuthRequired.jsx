import { useEffect, useState } from 'react'
import { api } from "../api/backend.js"
import AuthErrorPage from "../pages/errorPages/AuthErrorPage.jsx"

function AuthRequired({ children }) {
	const [isAuthenticated, setIsAuthenticated] = useState(true) // Optimistically assume authentication
	useEffect(() => {
		api.getSession()
			.then(session => setIsAuthenticated(session !== null))
	}, [])
	if (!isAuthenticated) {
		return <AuthErrorPage />
	}
	return children;
}

export default AuthRequired;
