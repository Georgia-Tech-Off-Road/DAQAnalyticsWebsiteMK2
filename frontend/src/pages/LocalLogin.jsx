import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api/backend.js'

function LocalLogin() {
	const passwordRef = useRef(null);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	async function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		const result = await api.loginLocal('testuser', passwordRef.current.value);
		if (result.ok) {
			navigate('/');
		} else {
			setError('Invalid credentials');
		}
	}

	return (
		<>
			<form onSubmit={handleSubmit}>
				<input type="text" name="username" id="username" value="testuser" readOnly={true} hidden/>
				<label htmlFor="password"> Enter password </label>
				<input ref={passwordRef} type="password" name="password" id="password" />
				<input type="submit" value="Submit" />
			</form>
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</>
	)
}

export default LocalLogin;
