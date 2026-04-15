const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = 'votre_secret_jwt_tres_securise';

// Base de données simulée en mémoire
const users = [];
const products = [
    { id: 1, name: 'Sérum Éclat', price: 45, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', description: 'Sérum illuminant à la vitamine C' },
    { id: 2, name: 'Crème Hydratante', price: 38, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400', description: 'Hydratation intense 24h' },
    { id: 3, name: 'Nettoyant Doux', price: 25, image: 'https://images.unsplash.com/photo-1556228720-1987df1c52b7?w=400', description: 'Nettoie en douceur sans dessécher' },
    { id: 4, name: 'Masque Réparateur', price: 52, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', description: 'Répare et régénère la peau' },
    { id: 5, name: 'Huile Précieuse', price: 65, image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe39?w=400', description: 'Nourrit et illumine' },
    { id: 6, name: 'Contour des Yeux', price: 42, image: 'https://images.unsplash.com/photo-1571781926291-280553e36a06?w=400', description: 'Réduit les cernes et poches' }
];
let orders = [];

console.log('🚀 Initialisation du serveur Beauty Shop...');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requis' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide' });
        req.user = user;
        next();
    });
};

// Routes API
app.get('/', (req, res) => {
    console.log('📄 Page d\'accueil demandée');
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: users.length + 1, email, password: hashedPassword, name };
    users.push(user);
    
    console.log(`✅ Nouvel utilisateur inscrit: ${email}`);
    res.json({ message: 'Inscription réussie' });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: 'Identifiants invalides' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    console.log(`✅ Connexion réussie: ${email}`);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/orders', authenticateToken, (req, res) => {
    const { items, total, shippingInfo } = req.body;
    const order = {
        id: orders.length + 1,
        userId: req.user.id,
        items,
        total,
        shippingInfo,
        date: new Date().toISOString(),
        status: 'pending'
    };
    orders.push(order);
    console.log(`📦 Nouvelle commande #${order.id} créée`);
    res.json({ message: 'Commande créée avec succès', orderId: order.id });
});

app.get('/api/orders', authenticateToken, (req, res) => {
    const userOrders = orders.filter(o => o.userId === req.user.id);
    res.json(userOrders);
});

app.listen(port, () => {
    console.log(`🌐 Serveur Beauty Shop démarré sur http://localhost:${port}`);
});