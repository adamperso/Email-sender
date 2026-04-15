const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    jwt.verify(token, config.jwt.secret, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide ou expiré' });
        }
        req.user = user;
        next();
    });
};

// Middleware pour vérifier le rôle admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
};

// Middleware optionnel - ajoute l'utilisateur si présent mais ne bloque pas
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, config.jwt.secret, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    isAdmin,
    optionalAuth
};
