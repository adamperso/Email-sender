const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

// Obtenir tous les produits (avec filtres optionnels)
router.get('/', optionalAuth, (req, res) => {
    try {
        const { category, featured, sort, limit, offset } = req.query;
        
        let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
        const params = [];

        // Filtre par catégorie
        if (category) {
            query += ' AND p.category_id = ?';
            params.push(category);
        }

        // Filtre produits en vedette
        if (featured === 'true') {
            query += ' AND p.featured = 1';
        }

        // Tri
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY p.price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY p.price DESC';
                break;
            case 'rating':
                query += ' ORDER BY p.rating DESC';
                break;
            case 'newest':
                query += ' ORDER BY p.created_at DESC';
                break;
            default:
                query += ' ORDER BY p.name ASC';
        }

        // Pagination
        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }
        if (offset) {
            query += ' OFFSET ?';
            params.push(parseInt(offset));
        }

        db.all(query, params, (err, products) => {
            if (err) {
                console.error('Erreur récupération produits:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }

            // Compter le total
            const countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1' + (category ? ' AND category_id = ?' : '');
            const countParams = category ? [category] : [];
            
            db.get(countQuery, countParams, (err, result) => {
                res.json({
                    products,
                    total: result ? result.total : products.length,
                    page: offset ? Math.floor(parseInt(offset) / (limit || 10)) + 1 : 1,
                    limit: parseInt(limit) || 10
                });
            });
        });
    } catch (error) {
        console.error('Erreur liste produits:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir un produit par ID
router.get('/:id', optionalAuth, (req, res) => {
    const productId = req.params.id;

    db.get(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
    `, [productId], (err, product) => {
        if (err) {
            console.error('Erreur récupération produit:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        // Récupérer les avis
        db.all('SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC', [productId], (err, reviews) => {
            res.json({
                product,
                reviews: reviews || []
            });
        });
    });
});

// Obtenir toutes les catégories
router.get('/categories/all', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
        if (err) {
            console.error('Erreur récupération catégories:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.json({ categories });
    });
});

// Rechercher des produits
router.get('/search/:query', (req, res) => {
    const query = `%${req.params.query}%`;
    
    db.all(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.name LIKE ? OR p.description LIKE ?
        ORDER BY p.name
    `, [query, query], (err, products) => {
        if (err) {
            console.error('Erreur recherche produits:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        res.json({ products });
    });
});

// Ajouter un avis sur un produit
router.post('/:id/reviews', authenticateToken, (req, res) => {
    const productId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
    }

    // Vérifier que l'utilisateur n'a pas déjà laissé un avis
    db.get('SELECT * FROM reviews WHERE product_id = ? AND user_id = ?', [productId, req.user.id], (err, existingReview) => {
        if (err) {
            console.error('Erreur vérification avis:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (existingReview) {
            return res.status(400).json({ error: 'Vous avez déjà laissé un avis pour ce produit' });
        }

        // Insérer l'avis
        db.run(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [productId, req.user.id, rating, comment || ''],
            function(err) {
                if (err) {
                    console.error('Erreur insertion avis:', err);
                    return res.status(500).json({ error: 'Erreur serveur' });
                }

                // Mettre à jour la note moyenne du produit
                db.run(`
                    UPDATE products 
                    SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ?),
                        reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)
                    WHERE id = ?
                `, [productId, productId, productId]);

                res.status(201).json({ 
                    message: 'Avis ajouté avec succès',
                    reviewId: this.lastID
                });
            }
        );
    });
});

module.exports = router;
