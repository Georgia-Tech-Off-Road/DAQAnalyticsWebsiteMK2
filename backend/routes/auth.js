const express = require("express")
const router = express.Router()
const db = require("../database/db")
const db_lib = require("../database/db-lib.js")
const cors = require('cors')
const multer = require('multer')
const passport = require("../middleware/auth/passport.js")
const samlStrategy = require("../middleware/auth/samlStrategy")
router.use(cors())
const fs = require('node:fs')


// Local Endpoints
router.post('/local/login',
	passport.authenticate('local', { failureRedirect: '/login' }),
	async (req, res) => {
	res.redirect('/')
})

// SAML Endpoints
router.get('/saml/metadata', (req, res) => {
	if (!samlStrategy) {
		return res.status(503).json({ error: 'SAML strategy not configured' });
	}
	const metadata = samlStrategy.generateServiceProviderMetadata(
		null,
		fs.readFileSync('sp-cert.pem', 'utf-8')
	);
	res.type('application/xml');
	res.send(metadata);
})

module.exports = router;
