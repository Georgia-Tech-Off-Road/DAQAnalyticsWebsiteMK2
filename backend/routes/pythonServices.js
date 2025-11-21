const express = require('express')
const fs = require('node:fs')
const app = express()
const microservices_hostname = "http://127.0.0.1:5000"
const path = require('node:path')
const cors = require('cors')
const router = express.Router()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/toCSV', async (req, res) => {
    const filePath = req.body.filePath

    // Check if file exists first
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath)
        return res.status(404).send('File not found')
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/csv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `filePath=${encodeURICompnent(filePath)}`
        })

        if (!response.ok) {
            throw new Error(`Flask service error: ${response.status}`)
        }

        const contentDisposition = response.headers.get('content-disposition')
        let filename = 'download.csv'
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
            if (filenameMatch) {
                filename = filenameMatch
            }
        }

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename ="${filename}"`)

        response.body.pipe(res)

    } catch (err) {
        console.error('Error:', err)
        if (!res.headersSent) {
            res.status(500).send('Error creating CSV file')
        }
    }
})

module.exports = router;