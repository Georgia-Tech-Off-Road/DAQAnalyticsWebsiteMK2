const express = require("express")
const router = express.Router()
const db = require("../database/db")
const crypto = require('crypto')

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
        // Get current datetime in ISO format
        const now = new Date().toISOString();
        const stmt = db.prepare(`
            INSERT INTO Dataset (id, title, 
                description, date, uploaded_at, updated_at, location_id, competition)
            VALUES (@id, @title, @description, @date, @uploaded_at, 
                @updated_at, @location_id, @competition)`)
        stmt.run({
            id: id,
            title: title,
            description: description || null,
            date: date,
            uploaded_at: now,
            updated_at: now,
            location_id: location_id || null,
            competition: competition ? 1 : 0,
        });
        res.status(201).json({ id })
    }
    catch (err) {
        console.log(`Error creating dataset: ${err}`)
        res.status(500).json( {error: err.message })
    }
})