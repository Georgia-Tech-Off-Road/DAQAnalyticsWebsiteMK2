const SAMLStrategy = require('@node-saml/passport-saml').Strategy;
const fs = require('node:fs');
const path = require('node:path');
const db_lib = require('../../database/db-lib');

const SAML_ENTRY_POINT = process.env.SAML_ENTRY_POINT;
const SAML_CERT_PATH = process.env.SAML_CERT_PATH;

// 🚨 IMPORTANT: never initialize SAML in test environment
if (process.env.NODE_ENV === 'test') {
	module.exports = null;
	return;
}

let samlStrategy = null;

if (SAML_ENTRY_POINT && SAML_CERT_PATH) {
	try {
		const certPath = path.resolve(__dirname, '../../', SAML_CERT_PATH);
		const cert = fs.readFileSync(certPath, 'utf-8');

		samlStrategy = new SAMLStrategy(
			{
				entryPoint: SAML_ENTRY_POINT,
				callbackUrl: "https://api.gtor-datahub.com/auth/saml/callback",
				issuer: "https://api.gtor-datahub.com/auth/saml/metadata",
				cert: cert,
				idpCert: "placeholder_certificate"
			},
			function(profile, done) {
				let authProvider = db_lib.getAuthProviderBySAMLUserID(profile.ID);

				if (authProvider === null) {
					return done(null, false);
				}

				let user = db_lib.getUserByID(authProvider.user_id);
				return done(null, user);
			}
		);
	} catch (err) {
		console.warn('SAML initialization failed:', err.message);
	}
} else {
	// No warning in test/CI environments
	if (process.env.NODE_ENV !== 'test') {
		console.warn('SAML strategy not configured: missing SAML_ENTRY_POINT or SAML_CERT env vars');
	}
}

module.exports = samlStrategy;