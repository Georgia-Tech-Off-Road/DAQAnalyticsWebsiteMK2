const express = require('express')
const fs = require('node:fs')
const app = express()
const hostname = '127.0.0.1'
const port = 3000
const microservices_hostname = "http://127.0.0.1:5000"
const path = require('node:path')
const multer = require('multer')

const uploadDir = path.join(__dirname, 'DAQFiles')
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true })
}

app.use(require('cors')())

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir)
	},
	filename: function (req, file, cb) {
		// Create a safe filename: timestamp + original name with unsafe chars replaced
		const safeName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
		cb(null, safeName)
	}
})

// multer upload instance (no file type or size limits)
const upload = multer({ storage })

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

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  // req.file contains info about the saved file
  // Example response: saved filename and original name
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size
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


