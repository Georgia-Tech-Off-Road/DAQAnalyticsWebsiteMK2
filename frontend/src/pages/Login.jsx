import * as urls from "../urls.js"
import { api } from '../api/backend.js'


export default function Login() {
	return (
		<>
			<a className="button" href={urls.localLogin()}> Local Login </a>
			<a className="button" href={api.getSAMLURL()}> Login with SSO </a>
		</>
	)
}


function handleSSOLogin() {
	api.SSOLogin();
}
