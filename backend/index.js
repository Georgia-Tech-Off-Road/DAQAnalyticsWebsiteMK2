const express = require('express')
const fs = require('node:fs')
const app = express()
const hostname = '127.0.0.1'
const port = 3000
const MICROSERVICES_URL = process.env.MICROSERVICES_URL
const path = require('node:path')
const cors = require('cors')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Import routers
const datasets = require('./routes/datasets')
const vehicles = require('./routes/vehicles')
const locations = require('./routes/locations')

// Define middleware first
app.use(cors())
app.use(express.json())

// Now define routes
app.use("/datasets", datasets)
app.use("/vehicles", vehicles)
app.use("/locations", locations)


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

