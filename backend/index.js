// Environmental Variables
const MICROSERVICES_URL = process.env.MICROSERVICES_URL
const SESSION_SECRET = process.env.SESSION_SECRET
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Imports
const express = require('express')
const fs = require('node:fs')
const app = express()
const hostname = 'localhost'
const port = process.env.BACKEND_PORT
const path = require('node:path')
const cors = require('cors')

const express_session = require("express-session")
const session_db = require("./database/session-db")
const SqliteStore = require("better-sqlite3-session-store")(express_session)
const session_store = new SqliteStore({
	client: session_db,
	expired: {
		clear: true,
		intervalMS: process.env.SESSION_DURATION || 21600000 // Defaults to 6 hrs.
	}
})
const session = require('express-session')({
		store: session_store,
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
	        secure: (process.env.NODE_ENV === 'production'),
	        sameSite: 'lax'
        }
});

const passport = require('./middleware/auth/passport')
const { requireAuth } = require('./middleware/auth/auth')
const corsOptions = {
        origin: FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
}
app.use(express.urlencoded({ extended: true }))

// Allow one hop from client to server (i.e reverse-proxy server)
app.set('trust proxy', 1)

// Import routers
const datasets = require('./routes/datasets')
const vehicles = require('./routes/vehicles')
const locations = require('./routes/locations')
const auth = require('./routes/auth')

// Define middleware first
app.use(cors(corsOptions))
app.use(express.json())
app.use(session)
app.use(passport.authenticate('session'))
// Now define routes
app.use("/datasets", datasets)
app.use("/vehicles", vehicles)
app.use("/locations", locations)
app.use("/auth", auth)

app.get('/', (req, res) => {
        res.send('Hello world from our backend!');
})


app.get('/echo/:msg', (req, res) => {
        res.send(req.params.msg);
})

app.get("/test-microservices", (req, res) => {
        fetch(`${MICROSERVICES_URL}/test`)
        .then( (response) => {
                return response.text()
        })
        .then(data => res.send(data))
        .catch( (err) => {
                console.error(err)
                res.status(500).send("Error fetching from microservices")
        })
})

if (require.main === module) {
        app.listen(port, hostname, () => {
        console.log(`App listenting on ${hostname}:${port}`);
        });
}


module.exports = app;
