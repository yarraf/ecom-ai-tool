const express = require('express');
const axios = require('axios');
const db = require('../db/database');

const router = express.Router();

const OPENROUTER_MODELS = [
  { id: 'openai/gpt-4o-mini',                       label: 'GPT-4o Mini (rapide)' },
  { id: 'openai/gpt-4o',                            label: 'GPT-4o (puissant)' },
  { id: 'anthropic/claude-3-haiku-20240307',        label: 'Claude 3 Haiku (rapide)' },
  { id: 'anthropic/claude-3.5-sonnet-20241022',     label: 'Claude 3.5 Sonnet' },
  { id: 'anthropic/claude-3.5-haiku-20241022',      label: 'Claude 3.5 Haiku' },
  { id: 'google/gemini-flash-1.5',                  label: 'Gemini Flash 1.5' },
  { id: 'google/gemini-2.0-flash-001',              label: 'Gemini 2.0 Flash' },
  { id: 'meta-llama/llama-3.1-8b-instruct:free',   label: 'Llama 3.1 8B (gratuit)' },
  { id: 'mistralai/mistral-7b-instruct:free',       label: 'Mistral 7B (gratuit)' },
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
    model = 'openai/gpt-4o-mini',
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

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
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

    const generatedDescription = response.data.choices[0].message.content;

    // Save to DB
    const stmt = db.prepare(`
      INSERT INTO descriptions (product_name, category, features, target_audience, tone, language, model_used, generated_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      productName,
      category || null,
      features || null,
      targetAudience || null,
      tone || null,
      language || 'fr',
      model,
      generatedDescription
    );

    res.json({
      id: result.lastInsertRowid,
      description: generatedDescription,
      model,
      tokensUsed: response.data.usage?.total_tokens || null,
    });
  } catch (err) {
    console.error('OpenRouter error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.error?.message || 'Erreur lors de la génération.';
    res.status(status).json({ error: message });
  }
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
