# CLAUDE.md — E-Commerce AI Tool

Contexte et conventions pour Claude Code sur ce projet.

---

## Stack

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + Mantine v7 (CopyButton, Skeleton, notifications uniquement) |
| Backend | Node.js + Express |
| IA | OpenRouter API |
| Base de données | SQLite (better-sqlite3) |
| Icônes | @tabler/icons-react (stroke fin) |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Couleurs | OKLCH via CSS custom properties |

---

## Structure

```
ecommerce-ai-tool/
├── .env                        ← OPENROUTER_API_KEY, PORT, FRONTEND_URL
├── server/
│   ├── index.js                ← Express app (port 3001)
│   ├── routes/descriptions.js  ← Tous les endpoints API
│   └── db/database.js          ← Init SQLite + migrations auto
└── client/src/
    ├── App.jsx                 ← Layout root, routing pages, stats
    ├── api.js                  ← Toutes les fonctions HTTP
    ├── index.css               ← Design tokens CSS, dark mode, accents
    └── components/
        ├── ProductForm.jsx     ← Formulaire génération (collapse options)
        ├── DescriptionResult.jsx ← Résultat + image
        └── History.jsx         ← Table historique
```

---

## API Endpoints

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Statut serveur |
| `GET` | `/api/descriptions/models` | Liste modèles disponibles |
| `POST` | `/api/descriptions/generate` | Générer description (avec fallback auto) |
| `POST` | `/api/descriptions/generate-image` | Générer image produit |
| `GET` | `/api/descriptions/stats` | Stats réelles (total, aujourd'hui, langue top) |
| `GET` | `/api/descriptions/history?limit=N` | Historique |
| `DELETE` | `/api/descriptions/history/:id` | Supprimer un item |
| `DELETE` | `/api/descriptions/history` | Vider l'historique |

---

## Base de données

```sql
CREATE TABLE descriptions (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name          TEXT NOT NULL,
  category              TEXT,
  features              TEXT,
  target_audience       TEXT,
  tone                  TEXT,
  language              TEXT DEFAULT 'fr',
  model_used            TEXT,
  generated_description TEXT NOT NULL,
  tokens_used           INTEGER,
  image_url             TEXT,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Migrations automatiques au démarrage (`tokens_used`, `image_url`).

---

## Modèles IA (tous gratuits)

| Label | ID OpenRouter |
|---|---|
| Llama 3.3 70B (défaut) | `meta-llama/llama-3.3-70b-instruct:free` |
| Gemma 3 27B | `google/gemma-3-27b-it:free` |
| Mistral 7B | `mistralai/mistral-7b-instruct:free` |
| Llama 3.1 8B | `meta-llama/llama-3.1-8b-instruct:free` |

**Fallback automatique** : si le modèle choisi est rate-limité (429), le serveur essaie les suivants dans l'ordre.

### Génération d'image

- Modèle : `bytedance-seed/seedream-4.5` ($0.04/image, nécessite crédits OpenRouter)
- Activée uniquement si l'utilisateur active le toggle **"Générer une image"** dans le formulaire
- Réponse : `choices[0].message.images[0].image_url.url` (base64 PNG)

---

## Design system

```css
--bg / --bg-2 / --surface / --fg / --muted / --border
--accent / --accent-strong / --accent-soft
--mono : JetBrains Mono
```

- `[data-theme="dark"]` sur le div root pour le dark mode
- `[data-accent="forest|cobalt|amber|crimson"]` pour les couleurs d'accent
- Persistés dans `localStorage`

---

## Conventions front

- Styles **inline JS** uniquement (objet `s` en bas de chaque fichier)
- Pas de CSS modules ni Tailwind
- `useIsMobile()` hook (< 768px) pour le responsive
- Sur mobile : layout colonne, header compact, StatsStrip 2×2
- Sur desktop : sidebar 56px + layout deux colonnes (form gauche, résultat droite)
- Boutons primaires : `background: var(--accent), color: #fff`

---

## Variables d'environnement

```env
OPENROUTER_API_KEY=sk-or-v1-xxx   # Clé OpenRouter (obligatoire)
PORT=3001                           # Port serveur
FRONTEND_URL=https://xxx.vercel.app # URL Vercel (production)
VITE_API_URL=https://xxx.railway.app # URL backend (production)
VITE_APP_VERSION=1.0.0              # Injecté par CI/CD
```

---

## Lancement local

```bash
# Backend
cd server && node index.js

# Frontend
cd client && npm run dev
```

Frontend : http://localhost:5173  
Backend : http://localhost:3001
