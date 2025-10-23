const express = require('express')
const fs = require('node:fs')
const app = express()
const hostname = '127.0.0.1'
const port = 3000

app.get('/', (req, res) => {
	res.send('Hello world!');
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


app.listen(port, hostname, () => {
	console.log(`App listenting on ${hostname}:${port}`);
});


