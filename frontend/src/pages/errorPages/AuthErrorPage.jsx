import * as urls from "../../urls.js"

function AuthErrorPage() {
	return (
		<div className="error-pg-container">
			<h1> Hold your horses there pal! You need to sign in first. </h1>
			<a href={urls.login()}> Login Here </a>
		</div>
	)
}

export default AuthErrorPage
