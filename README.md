# Éclat Naturel - Boutique de Beauté

Site e-commerce complet pour une marque de produits de beauté avec design moderne et élégant.

## 🌟 Fonctionnalités

- **Page d'accueil** avec hero section animée et présentation des produits
- **Catalogue de produits** avec images, descriptions et prix
- **Système de panier** persistant (localStorage)
- **Création de compte** avec authentification sécurisée
- **Paiement sécurisé** avec formulaire de checkout
- **Confirmation de commande**
- **Design responsive** adapté à tous les écrans
- **Animations fluides** et transitions élégantes
- **Palette de couleurs beige** moderne et sophistiquée

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Démarrer le serveur

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
/workspace
├── server.js              # Serveur Node.js/Express
├── package.json           # Dépendances et scripts
├── public/
│   ├── index.html         # Page HTML principale
│   ├── styles.css         # Styles CSS modernes
│   └── app.js             # Logique JavaScript frontend
└── README.md              # Ce fichier
```

## 🔧 Configuration

### Backend (server.js)
- Express.js pour le serveur web
- bcryptjs pour le hachage des mots de passe
- jsonwebtoken pour l'authentification
- CORS activé pour les requêtes cross-origin

### Frontend
- Vanilla JavaScript (pas de framework)
- CSS custom avec variables
- LocalStorage pour la persistance du panier
- Fetch API pour les requêtes HTTP

## 🎨 Design

Le design utilise une palette de couleurs beige élégante :
- Couleur principale : #d4a574 (beige doré)
- Secondaire : #f5ebe0 (beige clair)
- Texte : #3d3d3d (gris foncé)
- Police : Playfair Display (titres) + Lato (texte)

## 🛒 Fonctionnalités E-commerce

1. **Navigation** entre les pages sans rechargement
2. **Ajout au panier** avec notification toast
3. **Gestion des quantités** dans le panier
4. **Authentification** requise pour commander
5. **Formulaire de paiement** avec validation
6. **Confirmation** avec numéro de commande

## 📱 Responsive

Le site est entièrement responsive et s'adapte aux :
- Ordinateurs de bureau
- Tablettes
- Téléphones mobiles

## 🔐 Sécurité

- Mots de passe hachés avec bcrypt
- Tokens JWT pour l'authentification
- Validation des formulaires côté client et serveur
- Protection CSRF basique

## 🚀 Déploiement sur GitHub

### 1. Initialiser Git (si ce n'est pas déjà fait)

```bash
git init
git add .
git commit -m "Initial commit - Beauty shop e-commerce"
```

### 2. Créer un dépôt sur GitHub

Rendez-vous sur https://github.com/new et créez un nouveau dépôt nommé par exemple `beauty-shop`.

### 3. Lier le dépôt local à GitHub

```bash
git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/beauty-shop.git
```

### 4. Pousser le code vers GitHub

```bash
git branch -M main
git push -u origin main
```

### 5. Hébergement gratuit (optionnel)

Vous pouvez déployer gratuitement sur :

**Render :**
1. Créez un compte sur https://render.com
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre dépôt GitHub
4. Commande de build : `npm install`
5. Commande de démarrage : `npm start`

**Heroku :**
```bash
# Installer Heroku CLI
heroku login
heroku create beauty-shop
git push heroku main
```

**Vercel/Netlify :** (nécessite une configuration supplémentaire pour le backend)

## 📝 Notes

- Les données sont stockées en mémoire (perdues au redémarrage)
- Pour une vraie production, utilisez une base de données (MongoDB, PostgreSQL)
- Intégrez Stripe ou PayPal pour les paiements réels
- Ajoutez HTTPS pour la sécurité en production

## 👨‍💻 Auteur

Développé comme démonstration e-commerce complète.

## 📄 License

ISC
