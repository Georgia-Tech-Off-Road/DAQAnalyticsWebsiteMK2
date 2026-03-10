const express = require("express")
const router = express.Router()
const db = require("../database/db")
const db_lib = require("../database/db-lib.js")
const multer = require('multer')
const passport = require("../middleware/auth/passport.js")
const samlStrategy = require("../middleware/auth/samlStrategy")
const fs = require('node:fs')


// Local Endpoints
router.post('/local/login', (req, res, next) => {
	passport.authenticate('local', (err, user) => {
		if (err) return next(err)
		if (!user) return res.status(401).json({ error: 'Invalid credentials' })
		req.logIn(user, (err) => {
			if (err) return next(err)
			res.json({ success: true, user: { id: user.id, display_name: user.display_name, role: user.role } })
		})
	})(req, res, next)
})

// Session check
router.get('/session', (req, res) => {
	if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
	res.json({ user: { id: req.user.id, display_name: req.user.display_name, role: req.user.role } })
})

// Logout
router.post('/logout', (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err)
		req.session.destroy(() => {
			res.json({ success: true })
		})
	})
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
