const express = require('express')
const fs = require('node:fs')
const app = express()
const hostname = '127.0.0.1'
const port = 3000
const microservices_hostname = "http://127.0.0.1:5000"

app.get('/', (req, res) => {
	res.send('Goodbye!');
})

app.get('/data', (req, res) => {
	fs.readFile('2025-10-18 11_37_10.txt', 'utf8', (err, data) => {
		if (err) {
			console.error(err)
			res.send("Error reading file!")
		} else {
			res.send(data)
		}
	})
})

app.get('/echo/:msg', (req, res) => {
	res.send(req.params.msg);
})

app.get("/test-microservices", (req, res) => {
	fetch(`${microservices_hostname}/test`)
	.then( (response) => {
		return response.text()
	})
	.then(data => res.send(data))
	.catch( (err) => {
		console.error(err)
		res.status(500).send("Error fetching from microservices")
	})
})


app.listen(port, hostname, () => {
	console.log(`App listenting on ${hostname}:${port}`);
});