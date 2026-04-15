const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');

// Initialiser les routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

// Import du middleware d'auth
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Sécurité avec Helmet
app.use(helmet({
    contentSecurityPolicy: false, // Désactivé pour permettre les images externes
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par fenêtre
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'data/images')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Route Stripe (paiement) - placeholder pour implémentation future
app.post('/api/payment/create-intent', authenticateToken, async (req, res) => {
    // Implémentation Stripe à ajouter quand la clé API sera configurée
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Montant invalide' });
    }

    // En production, créer un PaymentIntent Stripe ici
    res.json({ 
        message: 'Paiement simulé réussi',
        clientSecret: 'simulated_secret_' + Date.now()
    });
});

// Page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Pages produits individuels
app.get('/product/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page catégories
app.get('/category/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page panier
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page checkout
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page compte utilisateur
app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page commandes
app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion 404
app.use((req, res) => {
    res.status(404).json({ error: 'Page non trouvée' });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({ 
        error: 'Erreur serveur interne',
        message: config.nodeEnv === 'development' ? err.message : undefined
    });
});

module.exports = app;
