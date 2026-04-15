const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

// Créer une commande
router.post('/', authenticateToken, (req, res) => {
    const { items, total, shippingInfo, paymentMethod = 'card' } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Le panier doit contenir au moins un produit' });
    }

    if (!total || total <= 0) {
        return res.status(400).json({ error: 'Le total de la commande est invalide' });
    }

    if (!shippingInfo || !shippingInfo.address || !shippingInfo.city || !shippingInfo.zipCode || !shippingInfo.email) {
        return res.status(400).json({ error: 'Les informations de livraison sont incomplètes' });
    }

    // Démarrer une transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Créer la commande
        db.run(
            `INSERT INTO orders (user_id, total, status, shipping_address, shipping_city, shipping_zip, shipping_email, payment_method, payment_status)
             VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, 'pending')`,
            [req.user.id, total, shippingInfo.address, shippingInfo.city, shippingInfo.zipCode, shippingInfo.email, paymentMethod],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    console.error('Erreur création commande:', err);
                    return res.status(500).json({ error: 'Erreur lors de la création de la commande' });
                }

                const orderId = this.lastID;

                // Insérer les items de la commande
                const insertItem = db.prepare(`
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES (?, ?, ?, ?)
                `);

                let errorOccurred = false;
                items.forEach((item, index) => {
                    insertItem.run([orderId, item.id, item.quantity, item.price], function(err) {
                        if (err && !errorOccurred) {
                            errorOccurred = true;
                            db.run('ROLLBACK');
                            console.error('Erreur insertion item commande:', err);
                            res.status(500).json({ error: 'Erreur lors de la création de la commande' });
                        }

                        // Si c'est le dernier item et pas d'erreur
                        if (index === items.length - 1 && !errorOccurred) {
                            insertItem.finalize();
                            db.run('COMMIT', (err) => {
                                if (err) {
                                    console.error('Erreur commit transaction:', err);
                                    return res.status(500).json({ error: 'Erreur finale de la commande' });
                                }

                                console.log(`📦 Nouvelle commande #${orderId} créée pour l'utilisateur ${req.user.id}`);
                                
                                // Mettre à jour les stocks
                                updateStocks(items, () => {
                                    res.status(201).json({
                                        message: 'Commande créée avec succès',
                                        orderId,
                                        orderNumber: `CMD-${Date.now()}-${orderId}`
                                    });
                                });
                            });
                        }
                    });
                });
            }
        );
    });
});

// Mettre à jour les stocks après une commande
function updateStocks(items, callback) {
    let completed = 0;
    
    items.forEach(item => {
        db.run(
            'UPDATE products SET stock = stock - ? WHERE id = ?',
            [item.quantity, item.id],
            () => {
                completed++;
                if (completed === items.length && callback) {
                    callback();
                }
            }
        );
    });
}

// Obtenir les commandes d'un utilisateur
router.get('/my-orders', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, orders) => {
            if (err) {
                console.error('Erreur récupération commandes:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }

            // Récupérer les items pour chaque commande
            const ordersWithItems = [];
            let completed = 0;

            if (orders.length === 0) {
                return res.json({ orders: [] });
            }

            orders.forEach((order, index) => {
                db.all(
                    `SELECT oi.*, p.name, p.image 
                     FROM order_items oi 
                     LEFT JOIN products p ON oi.product_id = p.id 
                     WHERE oi.order_id = ?`,
                    [order.id],
                    (err, items) => {
                        ordersWithItems[index] = {
                            ...order,
                            items: items || []
                        };

                        completed++;
                        if (completed === orders.length) {
                            res.json({ orders: ordersWithItems });
                        }
                    }
                );
            });
        }
    );
});

// Obtenir les détails d'une commande
router.get('/:id', authenticateToken, (req, res) => {
    const orderId = req.params.id;

    db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id], (err, order) => {
        if (err) {
            console.error('Erreur récupération commande:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (!order) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        // Récupérer les items
        db.all(
            `SELECT oi.*, p.name, p.image 
             FROM order_items oi 
             LEFT JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [orderId],
            (err, items) => {
                res.json({
                    order: {
                        ...order,
                        items: items || []
                    }
                });
            }
        );
    });
});

module.exports = router;
