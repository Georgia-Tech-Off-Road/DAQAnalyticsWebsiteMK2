const Database = require("better-sqlite3")
const path = require("path")
const fs = require("fs")

const db = new Database(path.join(__dirname, "data.db"));

// Enable and enforce foreign keys (very important!)   
db.pragma('foreign_keys = ON');

const schemaPath = path.join(__dirname, "schema.sql")

// Check if schemaPath exists
if (fs.existsSync(schemaPath)) {
    // Read schema statement from schema.sql
    const schema = fs.readFileSync(schemaPath).toString()
    db.exec(schema)
}

module.exports = db