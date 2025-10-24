const express = require('express')
const fs = require('node:fs')
const path = require('node:path')
const app = express()
const hostname = '127.0.0.1'
const port = 3000

app.get('/', (req, res) => {
    res.send('Goodbye!');
})

// GET /data
// - If ?path= is provided it will try to read that file
// - Otherwise it falls back to the project file name used previously
app.get('/data', async (req, res) => {
    const requested = req.query.path || '2025-10-18 11_37_10.txt'

    if (!requested) return res.status(400).send('Missing file path')

    try {
        // Resolve the path to prevent weird relative path behavior
        const resolved = path.resolve(requested)

        // Only allow .txt files here (basic safety)
        if (path.extname(resolved).toLowerCase() !== '.txt') {
            return res.status(400).send('Only .txt files are allowed')
        }

        // Verify file exists
        await fs.promises.access(resolved, fs.constants.R_OK)

        const data = await fs.promises.readFile(resolved, 'utf8')
        res.send(data)
    } catch (err) {
        if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
            console.error('File not found:', err)
            return res.status(404).send('File not found')
        }
        console.error(err)
        res.status(500).send('Error reading file')
    }
})

app.get('/echo/:msg', (req, res) => {
    res.send(req.params.msg);
})

// Keep an alternate route that accepts the path as a route parameter.
// Note: Windows backslashes must be URL-encoded when used in the path segment.
app.get('/data/:msg', async (req, res) => {
    const requested = req.params.msg

    if (!requested) return res.status(400).send('Missing file path')

    try {
        const resolved = path.resolve(requested)
        if (path.extname(resolved).toLowerCase() !== '.txt') {
            return res.status(400).send('Only .txt files are allowed')
        }

        await fs.promises.access(resolved, fs.constants.R_OK)
        const data = await fs.promises.readFile(resolved, 'utf8')
        res.send(data)
    } catch (err) {
        if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
            console.error('File not found:', err)
            return res.status(404).send('File not found')
        }
        console.error(err)
        res.status(500).send('Error reading file')
    }
})


app.listen(port, hostname, () => {
    console.log(`App listenting on ${hostname}:${port}`);
});


