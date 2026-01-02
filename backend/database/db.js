const Database = require("better-sqlite3")
const path = require("path")
const fs = require("fs")

const db = new Database(path.join(process.env.DATABASE_PATH));

// Enable and enforce foreign keys (very important!)   
db.pragma('foreign_keys = ON');

module.exports = db
