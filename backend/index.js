const express = require('express')
const fs = require('node:fs')
const app = express()
const hostname = '127.0.0.1'
const port = 3000
const microservices_hostname = "http://127.0.0.1:5000"
const path = require('node:path')
const cors = require('cors')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Import routers
const datasets = require('./routes/datasets')
const pythonServices = require('./routes/pythonServices')
const vehicles = require('./routes/vehicles')

// Define middleware first
app.use(cors())
app.use(express.json())

// Now define routes
app.use("/datasets", datasets)
app.use("/vehicles", vehicles)
app.use("/pythonServices", pythonServices)


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

app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName
    const filePath = path.join(__dirname, 'DAQFiles', fileName)

    // Check if file exists first
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath)
        return res.status(404).send('File not found')
    }

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error('Error downloading file:', err)
            // Only send error if headers haven't been sent yet
            if (!res.headersSent) {
                res.status(500).send('Error downloading file')
            }
        }
    })
})


