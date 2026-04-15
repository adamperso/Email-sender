const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const config = require('../config');

// S'inscrire
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
        }

        // Vérifier si l'email existe déjà
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Erreur base de données:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }

            if (user) {
                return res.status(400).json({ error: 'Cet email est déjà utilisé' });
            }

            // Hacher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Créer l'utilisateur
            db.run(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                function(err) {
                    if (err) {
                        console.error('Erreur insertion utilisateur:', err);
                        return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
                    }

                    console.log(`✅ Nouvel utilisateur inscrit: ${email}`);
                    res.status(201).json({ 
                        message: 'Inscription réussie',
                        userId: this.lastID
                    });
                }
            );
        });
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Se connecter
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Trouver l'utilisateur
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Erreur base de données:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Identifiants invalides' });
            }

            // Vérifier le mot de passe
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Identifiants invalides' });
            }

            // Générer le token JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name, role: user.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            console.log(`✅ Connexion réussie: ${email}`);
            res.json({
                message: 'Connexion réussie',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        });
    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir le profil utilisateur
router.get('/profile', require('../middleware/auth').authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            console.error('Erreur base de données:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({ user });
    });
});

// Mettre à jour le profil
router.put('/profile', require('../middleware/auth').authenticateToken, (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Nom requis' });
    }

    db.run('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, req.user.id], function(err) {
        if (err) {
            console.error('Erreur mise à jour:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.json({ message: 'Profil mis à jour avec succès' });
    });
});

module.exports = router;
