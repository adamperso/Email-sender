# 🌸 Éclat Naturel - Boutique E-commerce de Beauté

Une plateforme e-commerce moderne et professionnelle pour une marque de produits de beauté, développée avec une architecture fullstack robuste.

## ✨ Fonctionnalités

### Frontend
- **Page d'accueil** avec hero section animée et produits en vedette
- **Boutique complète** avec filtrage par catégories et tri (prix, note, nom)
- **Pages produits détaillées** avec descriptions, images et avis
- **Panier persistant** (localStorage) avec gestion des quantités
- **Recherche de produits** en temps réel
- **Système d'authentification** (inscription/connexion)
- **Espace client** avec historique des commandes
- **Checkout sécurisé** avec formulaire de paiement
- **Design responsive** adapté mobile, tablette et desktop
- **Animations fluides** et transitions élégantes

### Backend
- **API RESTful** complète avec Express.js
- **Base de données SQLite** avec relations (users, products, categories, orders, reviews)
- **Authentification JWT** sécurisée
- **Middleware de sécurité** (Helmet, rate limiting)
- **Gestion des stocks** automatique
- **Système d'avis** avec notes moyennes
- **Dashboard admin** (prêt pour extension)
- **Transactions SQL** pour les commandes

## 🏗️ Architecture du Projet

```
/workspace
├── config/                 # Configuration de l'application
├── middleware/             # Middlewares Express
├── models/                 # Modèles de données
├── routes/                 # Routes API
├── public/                 # Frontend
├── data/                   # Données persistantes
├── app.js                  # Configuration Express
└── server.js               # Point d'entrée
```

## 🚀 Installation et Démarrage

### 1. Installer les dépendances

```bash
cd /workspace
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

### 3. Démarrer le serveur

**Mode développement :**
```bash
npm run dev
```

**Mode production :**
```bash
npm start
```

Le serveur démarre sur **http://localhost:3000**

## 📦 Endpoints API

### Authentification
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/profile` - Obtenir son profil

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `GET /api/products/categories/all` - Catégories
- `GET /api/products/search/:query` - Recherche

### Commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/my-orders` - Mes commandes

## 🔒 Sécurité

- Helmet - En-têtes HTTP sécurisés
- Rate Limiting - Protection contre les attaques
- JWT - Authentification
- bcrypt - Hachage des mots de passe

## 📤 Pousser sur GitHub

```bash
git init
git add .
git commit -m "✨ Éclat Naturel - Site e-commerce complet"
git remote add origin https://github.com/VOTRE_NOM/eclat-naturel.git
git branch -M main
git push -u origin main
```

## 🛠️ Technologies

- Node.js + Express.js
- SQLite3
- JWT + bcryptjs
- HTML5/CSS3/JavaScript ES6+

---

**Éclat Naturel** © 2024 - Révélez votre beauté naturelle 🌸
