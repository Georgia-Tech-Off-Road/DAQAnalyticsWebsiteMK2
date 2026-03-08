// Environmental Variables
const MICROSERVICES_URL = process.env.MICROSERVICES_URL
const SESSION_SECRET = process.env.SESSION_SECRET

// Imports
const express = require('express')
const fs = require('node:fs')
const app = express()
const hostname = '127.0.0.1'
const port = 3000
const path = require('node:path')
const cors = require('cors')
const session = require('express-session')({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: { secure: (process.env.NODE_ENV === 'production') }
});
const passport = require('./middleware/auth/passport')
const { requireAuth } = require('./middleware/auth/auth')

app.use(express.urlencoded({ extended: true }))

// Import routers
const datasets = require('./routes/datasets')
const vehicles = require('./routes/vehicles')
const locations = require('./routes/locations')
const auth = require('./routes/auth')

// Define middleware first
app.use(cors())
app.use(express.json())
app.use(session)
app.use(passport.authenticate('session'))

// Now define routes
app.use("/datasets", requireAuth, datasets)
app.use("/vehicles", requireAuth, vehicles)
app.use("/locations", requireAuth, locations)
app.use("/auth", auth)

app.get('/', (req, res) => {
	res.send('Hello world from our backend!');
})


app.get('/echo/:msg', (req, res) => {
	res.send(req.params.msg);
})

app.get("/test-microservices", (req, res) => {
	fetch(`${MICROSERVICES_URL}/test`)
	.then( (response) => {
		return response.text()
	})
	.then(data => res.send(data))
	.catch( (err) => {
		console.error(err)
		res.status(500).send("Error fetching from microservices")
	})
})

if (require.main === module) {
	app.listen(port, hostname, () => {
	console.log(`App listenting on ${hostname}:${port}`);
	});
}


module.exports = app;

