const express = require("express")
const router = express.Router()
const db = require("../database/db")
const db_lib = require("../database/db-lib.js")
const cors = require('cors')
const multer = require('multer')
const passport = require("../middleware/auth/passport.js")

router.use(cors())

router.post('/local/login',
	passport.authenticate('local', { failureRedirect: '/login' }),
	async (req, res) => {
	res.redirect('/')
})

module.exports = router;
