// En local : charge .env depuis la racine. En production : variables Railway injectées directement.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), override: false });
const express = require('express');
const cors = require('cors');

const descriptionsRouter = require('./routes/descriptions');

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,            // URL Vercel en production
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app')) {
      cb(null, true);
    } else {
      cb(new Error(`CORS bloqué : ${origin}`));
    }
  },
}));
app.use(express.json());

app.use('/api/descriptions', descriptionsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
