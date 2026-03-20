const sqlite = require("better-sqlite3")

const SESSION_DATABASE_PATH = process.env.SESSION_DATABASE_PATH || "database/sessions.db"
const db = sqlite(SESSION_DATABASE_PATH);

module.exports = db
