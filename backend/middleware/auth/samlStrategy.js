const SAMLStrategy = require('@node-saml/passport-saml').Strategy;
const fs = require('node:fs');
const path = require('node:path');
const db = require('../../database/db');
const crypto = require('crypto')

// Load	ENVs
const BACKEND_URL = process.env.BACKEND_URL

const SAML_ENTRY_POINT = process.env.SAML_ENTRY_POINT;
const SAML_IDP_CERT1_PATH = process.env.SAML_IDP_CERT1_PATH;
const SAML_IDP_CERT2_PATH = process.env.SAML_IDP_CERT2_PATH;
const SAML_PRIVATE_KEY_PATH = process.env.SAML_PRIVATE_KEY_PATH;
const SAML_DECRYPTION_PVK_PATH = process.env.SAML_DECRYPTION_PVK_PATH;
const SAML_IDP_METADATA_URL = process.env.SAML_IDP_METADATA_URL

let samlStrategy = null;

if (BACKEND_URL	&& SAML_ENTRY_POINT && SAML_IDP_CERT1_PATH && SAML_IDP_CERT2_PATH && SAML_PRIVATE_KEY_PATH && SAML_DECRYPTION_PVK_PATH && SAML_IDP_METADATA_URL) {
	const cert1Path	= path.resolve(__dirname, '../../', SAML_IDP_CERT1_PATH);
	const cert1 = fs.readFileSync(cert1Path, 'utf-8');

	const cert2Path	= path.resolve(__dirname, '../..', SAML_IDP_CERT2_PATH);
	const cert2 = fs.readFileSync(cert2Path, 'utf-8');

	const privateKeyPath = path.resolve(__dirname, '../../', SAML_PRIVATE_KEY_PATH);
	const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

	const decryptionPvkPath	= path.resolve(__dirname, '../../', SAML_DECRYPTION_PVK_PATH);
	const decryptionPvk = fs.readFileSync(decryptionPvkPath, 'utf8');

	samlStrategy = new SAMLStrategy(
		{
			entryPoint: SAML_ENTRY_POINT,
			callbackUrl: `${BACKEND_URL}/auth/saml/callback`,
			issuer:	`${BACKEND_URL}/auth/saml/metadata`,
			idpCert: [cert1, cert2],
			idpMetadataUrl:	SAML_IDP_METADATA_URL,
			privateKey: privateKey,
			decryptionPvk: decryptionPvk
		},
		function(profile, done)	{
			try {
				db.prepare(`
					INSERT INTO User (id, email, display_name, role, last_login, created_at, updated_at)
					VALUES (?, ?, ?, 'guest', datetime('now'), datetime('now'), datetime('now'))
					ON CONFLICT (email) DO UPDATE SET
					display_name = excluded.display_name,
					last_login = datetime('now'),
					updated_at = datetime('now')
				`).run(crypto.randomUUID(), profile.email, profile.displayName);

				const user = db.prepare(`SELECT	id FROM	User WHERE email = ?`).get(profile.email)

				db.prepare(`
					INSERT INTO AuthProvider (user_id, provider_type, provider_uid)	VALUES (?, 'saml', ?) ON CONFLICT (provider_type, provider_uid)	DO NOTHING`)
				.run(user.id, profile.uid)

				return done(null, user);
			} catch	(err) {
				return done(err);
			}
		}
	);
} else {
	const required = { BACKEND_URL,	SAML_ENTRY_POINT, SAML_IDP_CERT1_PATH, SAML_IDP_CERT2_PATH, SAML_PRIVATE_KEY_PATH, SAML_DECRYPTION_PVK_PATH, SAML_IDP_METADATA_URL };
	const missing =	Object.entries(required).filter(([, v])	=> !v).map(([k]) => k);
	console.warn(`SAML strategy not	configured. Missing env	vars: ${missing.join(',	')}`);
}

module.exports = samlStrategy;
