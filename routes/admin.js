const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Obtenir tous les produits (admin)
router.get('/products', authenticateToken, isAdmin, (req, res) => {
    db.all(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        ORDER BY p.created_at DESC
    `, (err, products) => {
        if (err) {
            console.error('Erreur récupération produits:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ products });
    });
});

// Ajouter un produit (admin)
router.post('/products', authenticateToken, isAdmin, (req, res) => {
    const { name, description, price, category_id, image, stock, featured } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Nom et prix requis' });
    }

    db.run(
        `INSERT INTO products (name, description, price, category_id, image, stock, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description || '', price, category_id || null, image || '', stock || 0, featured ? 1 : 0],
        function(err) {
            if (err) {
                console.error('Erreur ajout produit:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            res.status(201).json({ message: 'Produit ajouté avec succès', productId: this.lastID });
        }
    );
});

// Mettre à jour un produit (admin)
router.put('/products/:id', authenticateToken, isAdmin, (req, res) => {
    const productId = req.params.id;
    const { name, description, price, category_id, image, stock, featured } = req.body;

    db.run(
        `UPDATE products 
         SET name = ?, description = ?, price = ?, category_id = ?, image = ?, stock = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, description, price, category_id, image, stock, featured ? 1 : 0, productId],
        function(err) {
            if (err) {
                console.error('Erreur mise à jour produit:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            res.json({ message: 'Produit mis à jour avec succès' });
        }
    );
});

// Supprimer un produit (admin)
router.delete('/products/:id', authenticateToken, isAdmin, (req, res) => {
    const productId = req.params.id;

    db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
        if (err) {
            console.error('Erreur suppression produit:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ message: 'Produit supprimé avec succès' });
    });
});

// Obtenir toutes les commandes (admin)
router.get('/orders', authenticateToken, isAdmin, (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, orders) => {
        if (err) {
            console.error('Erreur récupération commandes:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ orders });
    });
});

// Mettre à jour le statut d'une commande (admin)
router.patch('/orders/:id/status', authenticateToken, isAdmin, (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }

    db.run(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, orderId],
        function(err) {
            if (err) {
                console.error('Erreur mise à jour statut commande:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            res.json({ message: 'Statut de la commande mis à jour' });
        }
    );
});

// Obtenir tous les utilisateurs (admin)
router.get('/users', authenticateToken, isAdmin, (req, res) => {
    db.all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', (err, users) => {
        if (err) {
            console.error('Erreur récupération utilisateurs:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ users });
    });
});

// Statistiques du dashboard (admin)
router.get('/stats', authenticateToken, isAdmin, (req, res) => {
    const stats = {};
    let completed = 0;

    // Nombre total de commandes
    db.get('SELECT COUNT(*) as total FROM orders', (err, result) => {
        stats.totalOrders = result ? result.total : 0;
        checkComplete();
    });

    // Chiffre d'affaires total
    db.get('SELECT SUM(total) as revenue FROM orders WHERE status != ?', ['cancelled'], (err, result) => {
        stats.totalRevenue = result ? result.revenue : 0;
        checkComplete();
    });

    // Nombre total de clients
    db.get('SELECT COUNT(*) as total FROM users WHERE role = ?', ['customer'], (err, result) => {
        stats.totalCustomers = result ? result.total : 0;
        checkComplete();
    });

    // Nombre total de produits
    db.get('SELECT COUNT(*) as total FROM products', (err, result) => {
        stats.totalProducts = result ? result.total : 0;
        checkComplete();
    });

    function checkComplete() {
        completed++;
        if (completed === 4) {
            res.json({ stats });
        }
    }
});

module.exports = router;
