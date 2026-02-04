const express = require("express")
const router = express.Router()
const fs = require('node:fs')
const db = require("../database/db")
const db_lib = require("../database/db-lib")
const crypto = require('crypto')
const path = require('node:path')
const cors = require('cors')
const multer = require('multer')

// Import and initialize storage system
const storage_lib  = require('../storage')
const storage = storage_lib.getStorage()

// Enable CORS for this router
router.use(cors())

const uploadDir = path.join(__dirname, 'DAQFiles')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const multer_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // Create a safe filename: timestamp + original name with unsafe chars replaced
        const safeName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
        cb(null, safeName)
    }
})

const upload = multer({ multer_storage })

router.get("/", (req, res) => {
    const stmt = db.prepare("SELECT * FROM Dataset")
    const datasets = stmt.all()
    res.json(datasets)
})

router.get("/:id", (req, res) => {
	const dataset = db_lib.getDatasetByID(req.params.id)
	res.json(dataset)
})

router.post("/", (req, res) => {
    const { title, description, date, location_id, competition } = req.body;
    if (!title || !date) {
        return res.status(400).json({ error: "Missing required fields"});
    }
    try {
        // Get a randomized cryptographic ID (very low chance of ID collision)
        const id = crypto.randomUUID();
        // Get current datetime in SQLite format (YYYY-MM-DD HH:MM:SS)
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const stmt = db.prepare(`
            INSERT INTO Dataset (id, title,
                                 description, date, uploaded_at, updated_at, location_id, vehicle_id, competition)
            VALUES (@id, @title, @description, @date, @uploaded_at,
                    @updated_at, @location_id, @vehicle_id, @competition)`)
        stmt.run({
            id: id,
            title: title,
            description: description || null,
            date: date,
            uploaded_at: now,
            updated_at: now,
            location_id: location_id || null,
            vehicle_id: vehicle_id || null,
            competition: competition ? 1 : 0,
        });
        res.status(201).json({ id })
    }
    catch (err) {
        console.log(`Error creating dataset: ${err}`)
        res.status(500).json( {error: err.message })
    }
})


router.get('/download/:id', async (req, res) => {
	const datasetID = req.params.id;
	const key = `${datasetID}.json`

	if (!db_lib.getDatasetByID(datasetID)) {
		const err = `error: dataset with id ${datasetID} does not exist.`
		return res.status(404).json({ error: err })
	}
	try {
		if (!await storage.exists(key)) {
			const err = `error: datafile with key: ${key} does not exist, yet it has a corresponding dataset`
			console.error(err)
			return res.status(404).json({ error: err })
		}

		const metadata = await storage.stat(key)

		res.setHeader('Content-Type', 'application/json')
		res.setHeader('Content-Disposition', `attachment; filename="${datasetID}.json"`)
		res.setHeader('Content-Length', metadata.size)

		const stream = await storage.getReadStream(key)
		stream.pipe(res)

		stream.on('error', (err) => {
			console.error('Stream error:', err);

			if(!res.headersSent) {
				return res.status(500).json({ error: "Error streaming file" });
			}
		})

	} catch (err) {
		console.error("Download error:", err);
		res.status(500).json({ error: "Error downloading file" });
	}

})

router.get('/download/csv/:id', async (req, res) => {
	const datasetID = req.params.id;
	const json_key = `${datasetID}.json`
	const csv_key = `${datasetID}.csv`

	const dataset_meta = db_lib.getDatasetByID(datasetID)
	if (!dataset_meta) {
		return res.status(404).json({ error: "Dataset not found" });
	}

	// Check if CSV needs to be generated
	let needsConversion = false;

	if (!await storage.exists(csv_key)) {
		needsConversion = true;
	} else {
		// Compare CSV file modification time with dataset's updated_at
		const csvStats = await storage.stat(csv_key);
		const csvModTime = csvStats.lastModified;
		const datasetUpdatedAt = new Date(dataset_meta.updated_at);

		if (csvModTime < datasetUpdatedAt) {
			needsConversion = true;
		}
	}

	// Call microservices
	if (needsConversion) {
		try {
			// TODO: Replace hardcoded URL with env var
			const response = await fetch("http://127.0.0.1:5000/convert/json/csv", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					input_path: json_key,
					output_path: csv_key
				})
			});

			if (!response.ok) {
				return res.status(500).json({ error: "Failed to convert JSON to CSV" });
			}
		} catch (err) {
			console.error("Microservices error:", err);
			return res.status(500).json({ error: "Microservices unavailable" });
		}
	}

	try {
		const metadata = await storage.stat(csv_key);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="${datasetID}.csv"`);
		res.setHeader('Content-Length', metadata.size);

		const stream = await storage.getReadStream(csv_key)
		stream.pipe(res)

		stream.on('error', (err) => {
			console.error('Stream error:', err);

			if(!res.headersSent) {
				return res.status(500).json({ error: "Error streaming file" });
			}
		})
	} catch (err) {
		console.error("Download error:", err);
		res.status(500).json({ error: "Error downloading file" });
	}
})

router.post('/upload', upload.single('file'), (req, res) => {
    console.log('Upload request received:', req.body)
    console.log('File:', req.file)

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }
    const { title, description, date, location_id, vehicle_id, competition } = req.body;

    if (!title || !date) {
        return res.status(400).json({ error: "Missing required fields"});
    }
    try {
        // Get a randomized cryptographic ID (very low chance of ID collision)
        const id = crypto.randomUUID();
        // Get current datetime in SQLite format (YYYY-MM-DD HH:MM:SS)
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Convert date to SQLite format (YYYY-MM-DD HH:MM:SS)
        // Handles both "YYYY-MM-DD" and "YYYY-MM-DDTHH:MM" formats
        let formattedDate;
        if (date.includes('T')) {
            // datetime-local format: "2025-11-11T13:50"
            formattedDate = date.replace('T', ' ') + ':00';
        } else if (date.includes(':')) {
            // Already in correct format
            formattedDate = date;
        } else {
            // Date only: "2025-11-11"
            formattedDate = `${date} 00:00:00`;
        }

        const stmt = db.prepare(`
            INSERT INTO Dataset (id, title,
                    description, date, uploaded_at, updated_at, location_id, vehicle_id, competition)
            VALUES (@id, @title, @description, @date, @uploaded_at,
                    @updated_at, @location_id, @vehicle_id, @competition)`)
        stmt.run({
            id: id,
            title: title,
            description: description || null,
            date: formattedDate,
            uploaded_at: now,
            updated_at: now,
            location_id: location_id || null,
            vehicle_id: vehicle_id || null,
            competition: competition ? 1 : 0,
        });

        console.log(`Dataset created successfully with ID: ${id}`)
        res.status(201).json({ id, filename: req.file.filename })
    }
    catch (err) {
        console.log(`Error creating dataset: ${err}`)
        res.status(500).json( {error: err.message })
    }
})

module.exports = router;
