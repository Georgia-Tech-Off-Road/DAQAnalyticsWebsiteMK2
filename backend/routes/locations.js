const express = require('express')
const router = express.Router()
const db = require('../database/db')
const crypto = require('crypto')
const cors = require('cors')
const validation = require('../middleware/validation/validation')
const schemas = require('../middleware/validation/schemas')
const Joi = require('joi')

router.use(cors())

router.get('/', (req, res) => {
    try {
        const stmt = db.prepare(`SELECT * FROM Location`)
            const locations = stmt.all()
        res.json({locations: locations})
    } catch (err) {
        console.log(`Error when fetching locations: ${err}`)
        res.status(500).json({error: err.message})
    }
})

router.get('/:id', (req, res) => {
    try {
        const stmt = db.prepare(`SELECT * FROM Location WHERE id = ?`)
        const location = stmt.get(req.params.id)
        if (!location) {
            return res.status(404).json({error: `Location with ID: ${req.params.id} not found`})
        }
        return res.json({location: location})
    } catch (err) {
        console.log(`Error retrieving location: ${err}`)
        return res.status(500).json({error: err.message })
    }
})

router.post('/', (req, res) => {
    
    const { error } = schemas.Location.validate(req.body);

    if (error) {
        const details = error.details

        const message = details.map(i => i.message).join(',')

        console.log("error", message);
        return res.status(422).json({error: message})
    }

    const { title, description, competition, latitude, longitude, parent_id } = req.body;

    const id = crypto.randomUUID()
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        const stmt = db.prepare(`INSERT INTO Location (id, title,
                description, competition, created_at, updated_at, 
                latitude, longitude, parent_id)
                VALUES (@id, @title, @description, @competition, @created_at,
                    @updated_at, @latitude, @longitude, @parent_id)`);
        
        stmt.run({
            id: id,
            title: title,
            description: description,
            competition: competition ? 1 : 0,
            created_at: now,
            updated_at: now,
            latitude: latitude,
            longitude: longitude,
            parent_id: parent_id
        })

        console.log(`Location succesfully created with ID: ${id}`)
        return res.status(201).json({id: id})
    } catch (err) {
        console.log(`Error when creating location: ${err}`)
        return res.status(500).json({error: err.message})
    }
})

module.exports = router