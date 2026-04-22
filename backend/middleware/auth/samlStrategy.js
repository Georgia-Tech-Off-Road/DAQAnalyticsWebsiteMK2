const SAMLStrategy = require('@node-saml/passport-saml').Strategy;
const fs = require('node:fs');
const path = require('node:path');
const db_lib = require('../../database/db-lib');


// Load ENVs
const BACKEND_URL = process.env.BACKEND_URL

const SAML_ENTRY_POINT = process.env.SAML_ENTRY_POINT;
const SAML_CERT_PATH = process.env.SAML_CERT_PATH;
const SAML_PRIVATE_KEY_PATH = process.env.SAML_PRIVATE_KEY_PATH;
const SAML_DECRYPTION_PVK_PATH = process.env.SAML_DECRYPTION_PVK_PATH;
const SAML_IDP_METADATA_URL = process.env.SAML_IDP_METADATA_URL

let samlStrategy = null;

if (SAML_ENTRY_POINT && SAML_CERT_PATH && SAML_PRIVATE_KEY_PATH && SAML_DECRYPTION_PVK_PATH && SAML_IDP_METADATA_URL) {
	const certPath = path.resolve(__dirname, '../../', SAML_CERT_PATH);
	const cert = fs.readFileSync(certPath, 'utf-8');

	const privateKeyPath = path.resolve(__dirname, '../../', SAML_PRIVATE_KEY_PATH);
	const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

	const decryptionPvkPath = path.resolve(__dirname, '../../', SAML_DECRYPTION_PVK_PATH);
	const decryptionPvk = fs.readFileSync(decryptionPvkPath, 'utf8');

	samlStrategy = new SAMLStrategy(
		{
			entryPoint: SAML_ENTRY_POINT,
			callbackUrl: `${BACKEND_URL}/auth/saml/callback`,
			issuer: `${BACKEND_URL}/auth/saml/metadata`,
			idpCert: cert,
			idpMetadataUrl: SAML_IDP_METADATA_URL,
			privateKey: privateKey,
			decryptionPvk: decryptionPvk
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
} else {
	console.warn('SAML strategy not configured: missing BACKEND_URL, SAML_ENTRY_POINT, SAML_CERT_PATH, SAML_PRIVATE_KEY_PATH, SAML_DECRYPTION_PVK_PATH, SAML_IDP_METADATA_URL env vars');
}

module.exports = samlStrategy;
