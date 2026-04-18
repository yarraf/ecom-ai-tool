# E-Commerce AI Tool

Outil intelligent de génération de contenus e-commerce propulsé par l'IA via **OpenRouter**.

---

## Fonctionnalités

- **Générateur de descriptions produits** — Génère des descriptions professionnelles, multilingues et personnalisées grâce à l'IA
- **Multi-modèles** — GPT-4o, Claude 3.5 Sonnet, Gemini Flash, Llama 3.1 (via OpenRouter)
- **Multi-langue** — Français, Anglais, Arabe
- **Tons personnalisables** — Professionnel, Luxueux, Technique, Minimaliste...
- **Historique** — Sauvegarde automatique des générations en base SQLite
- **Interface moderne** — Dashboard SaaS avec Mantine UI

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + Mantine UI |
| Backend | Node.js + Express |
| IA | OpenRouter API |
| Base de données | SQLite (better-sqlite3) |
| Icônes | Tabler Icons |

---

## Structure du projet

```
ecommerce-ai-tool/
├── .env                          ← Variables d'environnement
├── .gitignore
├── README.md
│
├── server/                       ← Backend Node.js (port 3001)
│   ├── index.js                  ← Point d'entrée Express
│   ├── routes/
│   │   └── descriptions.js       ← Endpoints API
│   └── db/
│       └── database.js           ← Init SQLite
│
└── client/                       ← Frontend React (port 5173)
    ├── vite.config.js
    └── src/
        ├── main.jsx              ← Provider Mantine
        ├── App.jsx               ← Layout AppShell + navigation
        ├── api.js                ← Appels HTTP
        ├── index.css
        └── components/
            ├── ProductForm.jsx        ← Formulaire de génération
            ├── DescriptionResult.jsx  ← Affichage du résultat
            └── History.jsx            ← Historique SQLite
```

---

## API Endpoints

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Statut du serveur |
| `GET` | `/api/descriptions/models` | Liste des modèles IA disponibles |
| `POST` | `/api/descriptions/generate` | Générer une description produit |
| `GET` | `/api/descriptions/history` | Récupérer l'historique |
| `DELETE` | `/api/descriptions/history/:id` | Supprimer un élément |
| `DELETE` | `/api/descriptions/history` | Vider l'historique |

### Exemple de requête `POST /api/descriptions/generate`

```json
{
  "productName": "Sac à main en cuir Milano",
  "category": "Mode & Vêtements",
  "features": "Cuir véritable, fermeture dorée, 3 compartiments",
  "targetAudience": "Femmes 25-45 ans, professionnelles",
  "tone": "luxueux",
  "language": "fr",
  "model": "openai/gpt-4o-mini"
}
```

---

## Base de données

**Fichier :** `server/db/ecommerce.db` (SQLite, créé automatiquement)

```sql
CREATE TABLE descriptions (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name         TEXT    NOT NULL,
  category             TEXT,
  features             TEXT,
  target_audience      TEXT,
  tone                 TEXT,
  language             TEXT,
  model_used           TEXT,
  generated_description TEXT   NOT NULL,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Installation & lancement

### Prérequis

- Node.js >= 18
- Clé API [OpenRouter](https://openrouter.ai)

### 1. Cloner le projet

```bash
git clone https://github.com/TON_USERNAME/ecommerce-ai-tool.git
cd ecommerce-ai-tool
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditer `.env` :

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
PORT=3001
```

### 3. Installer les dépendances

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Lancer l'application

```bash
# Terminal 1 — Backend
cd server && node index.js

# Terminal 2 — Frontend
cd client && npm run dev
```

Ouvrir **http://localhost:5173**

---

## Modèles IA disponibles

| Modèle | ID OpenRouter | Notes |
|---|---|---|
| GPT-4o Mini | `openai/gpt-4o-mini` | Rapide, économique |
| GPT-4o | `openai/gpt-4o` | Puissant |
| Claude 3 Haiku | `anthropic/claude-3-haiku` | Rapide |
| Claude 3.5 Sonnet | `anthropic/claude-3.5-sonnet` | Qualité premium |
| Gemini Flash 1.5 | `google/gemini-flash-1.5` | Multimodal |
| Llama 3.1 8B | `meta-llama/llama-3.1-8b-instruct:free` | Gratuit |

---

## Roadmap

- [x] Générateur de descriptions produits
- [ ] Générateur de copy marketing (ads, emails, social media)
- [ ] Optimisation SEO
- [ ] Analyse des avis clients
- [ ] Chatbot support client

---

## Licence

MIT
