const express = require('express');
const axios = require('axios');
const db = require('../db/database');

const router = express.Router();

const OPENROUTER_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (gratuit)' },
  { id: 'google/gemma-3-27b-it:free',             label: 'Gemma 3 27B (gratuit)'   },
  { id: 'mistralai/mistral-7b-instruct:free',     label: 'Mistral 7B (gratuit)'    },
  { id: 'meta-llama/llama-3.1-8b-instruct:free',  label: 'Llama 3.1 8B (gratuit)'  },
];

// Fallback chain si le modèle principal est rate-limité
const FREE_FALLBACK_CHAIN = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
];

// GET available models
router.get('/models', (req, res) => {
  res.json(OPENROUTER_MODELS);
});

// POST generate description
router.post('/generate', async (req, res) => {
  const {
    productName,
    category,
    features,
    targetAudience,
    tone,
    language,
    model = 'meta-llama/llama-3.3-70b-instruct:free',
    extraInstructions,
  } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'Le nom du produit est requis.' });
  }

  const langLabel = language === 'fr' ? 'français' : language === 'ar' ? 'arabe' : 'anglais';

  const prompt = `Tu es un expert en copywriting e-commerce. Génère une description produit professionnelle et convaincante.

Produit : ${productName}
${category ? `Catégorie : ${category}` : ''}
${features ? `Caractéristiques clés : ${features}` : ''}
${targetAudience ? `Audience cible : ${targetAudience}` : ''}
${tone ? `Ton souhaité : ${tone}` : 'Ton souhaité : professionnel et engageant'}
Langue de la description : ${langLabel}
${extraInstructions ? `Instructions supplémentaires : ${extraInstructions}` : ''}

Génère une description produit structurée avec :
1. Un accroche percutante (1-2 phrases)
2. Une description principale (3-4 phrases)
3. Les points forts en bullet points (3-5 points)
4. Un appel à l'action

Réponds directement avec la description, sans commentaire préliminaire.`;

  // Construire la chaîne de fallback : modèle choisi + autres gratuits
  const chain = [model, ...FREE_FALLBACK_CHAIN.filter(m => m !== model)]

  let lastErr = null
  for (const currentModel of chain) {
    try {
      if (currentModel !== model) console.log(`[FALLBACK] tentative avec ${currentModel}`)

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        { model: currentModel, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 800 },
        { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3001', 'X-Title': 'Ecommerce AI Tool' } }
      )

      const generatedDescription = response.data.choices[0].message.content
      const tokensUsed = response.data.usage?.total_tokens || null

      const result = db.prepare(`
        INSERT INTO descriptions (product_name, category, features, target_audience, tone, language, model_used, generated_description, tokens_used)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(productName, category || null, features || null, targetAudience || null, tone || null, language || 'fr', currentModel, generatedDescription, tokensUsed)

      return res.json({ id: result.lastInsertRowid, description: generatedDescription, model: currentModel, tokensUsed })

    } catch (err) {
      const status = err.response?.status
      console.error(`[ERROR] ${currentModel} →`, err.response?.data?.error?.message || err.message)
      // Si rate limit (429) ou provider error, tenter le suivant
      if (status === 429 || status === 503 || err.response?.data?.error?.message?.includes('Provider returned error')) {
        lastErr = err
        continue
      }
      // Autre erreur : arrêter
      return res.status(status || 500).json({ error: err.response?.data?.error?.message || 'Erreur lors de la génération.' })
    }
  }

  res.status(503).json({ error: 'Tous les modèles sont temporairement indisponibles. Réessayez dans quelques instants.' })
});

// POST generate image
router.post('/generate-image', async (req, res) => {
  const { productName, category, features, descriptionId } = req.body;
  if (!productName) return res.status(400).json({ error: 'Nom du produit requis.' });

  const prompt = [
    `Professional product photo of ${productName}`,
    category || null,
    features  || null,
    'high quality, commercial photography, clean white background, sharp details',
  ].filter(Boolean).join(', ');

  console.log('[IMAGE] endpoint atteint');
  console.log('[IMAGE PROMPT]', prompt);

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'bytedance-seed/seedream-4.5',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'Ecommerce AI Tool',
        },
      }
    );

    console.log('[IMAGE] status HTTP:', response.status);
    console.log('[IMAGE] réponse brute:', JSON.stringify(response.data, null, 2));

    const message = response.data.choices?.[0]?.message;
    // Le modèle retourne l'image dans message.images[0].image_url.url (data:image/png;base64,...)
    const imageUrl =
      message?.images?.[0]?.image_url?.url ||
      message?.content ||
      null;

    console.log('[IMAGE] imageUrl extrait (début):', imageUrl?.substring(0, 80));

    if (descriptionId && imageUrl) {
      db.prepare('UPDATE descriptions SET image_url = ? WHERE id = ?').run(imageUrl, descriptionId);
    }

    res.json({ imageUrl });
  } catch (err) {
    console.error('[IMAGE ERROR] status:', err.response?.status);
    console.error('[IMAGE ERROR] data:', JSON.stringify(err.response?.data, null, 2));
    console.error('[IMAGE ERROR] message:', err.message);
    res.status(500).json({ error: "Erreur lors de la génération d'image." });
  }
});

// GET stats
router.get('/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM descriptions').get().count;

  const today = db.prepare(
    "SELECT COUNT(*) as count FROM descriptions WHERE date(created_at) = date('now')"
  ).get().count;

  const topLang = db.prepare(`
    SELECT language, COUNT(*) as count
    FROM descriptions
    WHERE language IS NOT NULL
    GROUP BY language
    ORDER BY count DESC
    LIMIT 1
  `).get();

  res.json({
    total,
    today,
    topLanguage: topLang?.language ?? null,
  });
});

// GET history
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const rows = db
    .prepare('SELECT * FROM descriptions ORDER BY created_at DESC LIMIT ?')
    .all(limit);
  res.json(rows);
});

// DELETE history item
router.delete('/history/:id', (req, res) => {
  db.prepare('DELETE FROM descriptions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// DELETE all history
router.delete('/history', (req, res) => {
  db.prepare('DELETE FROM descriptions').run();
  res.json({ success: true });
});

module.exports = router;
