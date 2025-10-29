const express = require('express')
const fs = require('node:fs')
const app = express()
const hostname = '127.0.0.1'
const port = 3000
const path = require('node:path')


app.use(require('cors')())

app.get('/', (req, res) => {
	res.send('Goodbye!');
})

app.get('/data/:filePath', (req, res) => {
	
	fs.readFile(path.join('DAQFiles', req.params.filePath), 'utf8', (err, data) => {
		if (err) {
			console.error(err)
			res.send("Error reading file!")
		} else {
			res.send(data)
		}
	})
})

app.get('/data/', (req, res) => {
	
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


app.listen(port, hostname, () => {
	console.log(`App listenting on ${hostname}:${port}`);
});

app.get('/listFiles/', (req, res) => {
	const directoryPath = './DAQFiles'

	fs.readdir(directoryPath, (err, files) => {
		if (err) {
			console.error(err)
			res.status(500).send("Error aqcuirring files!")
			return
		} 
			
		res.send(files)
		
	})
})


