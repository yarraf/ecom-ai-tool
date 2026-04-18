const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'ecommerce.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS descriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    category TEXT,
    features TEXT,
    target_audience TEXT,
    tone TEXT,
    language TEXT,
    model_used TEXT,
    generated_description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
