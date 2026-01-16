const express = require("express")
const router = express.Router()
const fs = require('node:fs')
const db = require("../database/db")
const crypto = require('crypto')
const path = require('node:path')
const cors = require('cors')
const multer = require('multer')

// Enable CORS for this router
router.use(cors())

const uploadDir = path.join(__dirname, 'DAQFiles')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

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

const upload = multer({ storage })

router.get("/", (req, res) => {
    const stmt = db.prepare("SELECT * FROM Dataset")
    const datasets = stmt.all()
    res.json(datasets)
})

router.get("/:id", (req, res) => {
    const stmt = db.prepare("SELECT * FROM Dataset WHERE id = ?");
    const dataset = stmt.get(req.params.id)
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


router.get('/download/:id', (req, res) => {
	const dataset_ID = req.params.id;
	const file_path = path.join(process.cwd(), "DAQFiles", `${dataset_ID}.txt`)

	res.download(file_path, (err) => {
		if (err) {
			console.error(err)
			res.status(404).json({ error: "File not found" });
		}
	})

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
