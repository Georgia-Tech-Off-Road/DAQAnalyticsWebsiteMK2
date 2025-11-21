const express = require("express")
const router = express.Router()
const db = require("../database/db")
const crypto = require('crypto')
const cors = require('cors')

router.use(cors())

router.post('/', (req, res) => {
    console.log('Upload request received:', req.body)

    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Missing required fields"});
    }
    try {
        // Get a randomized cryptographic ID (very low chance of ID collision)
        const id = crypto.randomUUID();
        // Get current datetime in SQLite format (YYYY-MM-DD HH:MM:SS)
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');


        const stmt = db.prepare(`
            INSERT INTO Vehicle (id, title,
                    description, uploaded_at, updated_at)
            VALUES (@id, @title, @description, @uploaded_at,
                    @updated_at)`)
        stmt.run({
            id: id,
            title: title,
            description: description || null,
            uploaded_at: now,
            updated_at: now
        });

        console.log(`Vehicle created successfully with ID: ${id}`)
        res.status(201).json({ id })
    }
    catch (err) {
        console.log(`Error creating vehicle: ${err}`)
        res.status(500).json( {error: err.message })
    }
})

router.get("/", (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM Vehicle ORDER BY title")
        const vehicles = stmt.all()
        res.json(vehicles)
    } catch (err) {
        console.log(`Error fetching vehicles: ${err}`)
        res.status(500).json({ error: err.message })
    }
})

router.get("/:id", (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM Vehicle WHERE id = ?")
        const vehicle = stmt.get(req.params.id)
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found" })
        }
        res.json(vehicle)
    } catch (err) {
        console.log(`Error fetching vehicle: ${err}`)
        res.status(500).json({ error: err.message })
    }
})

module.exports = router