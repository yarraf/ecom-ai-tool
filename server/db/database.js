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
    language TEXT DEFAULT 'fr',
    model_used TEXT,
    generated_description TEXT NOT NULL,
    tokens_used INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration : ajouter tokens_used si colonne absente (base existante)
const cols = db.prepare("PRAGMA table_info(descriptions)").all().map(c => c.name);
if (!cols.includes('tokens_used')) {
  db.exec('ALTER TABLE descriptions ADD COLUMN tokens_used INTEGER');
}
if (!cols.includes('image_url')) {
  db.exec('ALTER TABLE descriptions ADD COLUMN image_url TEXT');
}

module.exports = db;
