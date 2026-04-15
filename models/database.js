const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

// Initialiser la base de données SQLite
const dbPath = path.resolve(config.database.path);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erreur connexion base de données:', err.message);
    } else {
        console.log('✅ Connecté à la base de données SQLite:', dbPath);
        initializeDatabase();
    }
});

// Initialiser les tables
function initializeDatabase() {
    // Table utilisateurs
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'customer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Erreur création table users:', err);
        else console.log('✅ Table users créée');
    });

    // Table catégories
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Erreur création table categories:', err);
        else console.log('✅ Table categories créée');
    });

    // Table produits
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category_id INTEGER,
            image TEXT,
            images TEXT,
            stock INTEGER DEFAULT 0,
            featured BOOLEAN DEFAULT 0,
            rating REAL DEFAULT 0,
            reviews_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )
    `, (err) => {
        if (err) console.error('Erreur création table products:', err);
        else console.log('✅ Table products créée');
    });

    // Table commandes
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            shipping_address TEXT,
            shipping_city TEXT,
            shipping_zip TEXT,
            shipping_email TEXT,
            payment_method TEXT,
            payment_status TEXT DEFAULT 'pending',
            stripe_payment_intent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Erreur création table orders:', err);
        else console.log('✅ Table orders créée');
    });

    // Table items de commande
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `, (err) => {
        if (err) console.error('Erreur création table order_items:', err);
        else console.log('✅ Table order_items créée');
    });

    // Table avis
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Erreur création table reviews:', err);
        else console.log('✅ Table reviews créée');
    });

    // Insérer des données de démo
    insertDemoData();
}

// Insérer des données de démonstration
function insertDemoData() {
    // Attendre que les tables soient créées
    setTimeout(() => {
        // Catégories
        const categories = [
            { name: 'Soins Visage', description: 'Produits de soin pour le visage', image: 'https://images.unsplash.com/photo-1556228720-1987df1c52b7?w=400' },
            { name: 'Soins Corps', description: 'Produits de soin pour le corps', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400' },
            { name: 'Maquillage', description: 'Produits de maquillage naturels', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
            { name: 'Parfums', description: 'Parfums et eaux de toilette', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400' },
            { name: 'Accessoires', description: 'Accessoires de beauté', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400' }
        ];

        let catInserted = 0;
        categories.forEach(cat => {
            db.run(
                'INSERT OR IGNORE INTO categories (name, description, image) VALUES (?, ?, ?)',
                [cat.name, cat.description, cat.image],
                () => {
                    catInserted++;
                    if (catInserted === categories.length) {
                        insertProducts();
                    }
                }
            );
        });

        function insertProducts() {
            // Produits
            const products = [
                { name: 'Sérum Éclat Vitamine C', description: 'Sérum illuminant à la vitamine C pure pour un teint radiant. Formule légère qui pénètre rapidement.', price: 45.00, category_id: 1, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', stock: 50, featured: 1, rating: 4.8 },
                { name: 'Crème Hydratante Intense', description: 'Hydratation profonde 24h avec acide hyaluronique et beurres végétaux.', price: 38.00, category_id: 1, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=600', stock: 75, featured: 1, rating: 4.7 },
                { name: 'Nettoyant Doux Micellaire', description: 'Eau micellaire douce qui nettoie et démaquille sans dessécher la peau.', price: 25.00, category_id: 1, image: 'https://images.unsplash.com/photo-1556228720-1987df1c52b7?w=600', stock: 100, featured: 0, rating: 4.5 },
                { name: 'Masque Réparateur Nuit', description: 'Masque de nuit réparateur aux peptides et céramides pour régénérer la peau.', price: 52.00, category_id: 1, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', stock: 30, featured: 1, rating: 4.9 },
                { name: 'Huile Précieuse Multi-Usages', description: 'Huile sèche précieuse pour visage, corps et cheveux. Nourrit et illumine.', price: 65.00, category_id: 2, image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe39?w=600', stock: 40, featured: 1, rating: 4.8 },
                { name: 'Contour des Yeux Liftant', description: 'Soin contour des yeux liftant qui réduit cernes, poches et rides.', price: 42.00, category_id: 1, image: 'https://images.unsplash.com/photo-1571781926291-280553e36a06?w=600', stock: 60, featured: 0, rating: 4.6 },
                { name: 'Gommage Corps Sucre', description: 'Gommage exfoliant au sucre et huiles essentielles pour une peau douce.', price: 32.00, category_id: 2, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600', stock: 45, featured: 0, rating: 4.4 },
                { name: 'Lait Corporel Satiné', description: 'Lait corporel hydratant à la texture soyeuse pour peaux sèches.', price: 28.00, category_id: 2, image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe39?w=600', stock: 80, featured: 0, rating: 4.5 },
                { name: 'Rouge à Lèvres Bio', description: 'Rouge à lèvres longue tenue enrichi en ingrédients biologiques.', price: 24.00, category_id: 3, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600', stock: 120, featured: 1, rating: 4.7 },
                { name: 'Mascara Volume Intense', description: 'Mascara volumateur pour des cils spectaculaires sans grumeaux.', price: 29.00, category_id: 3, image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600', stock: 90, featured: 0, rating: 4.6 },
                { name: 'Fond de Teint Naturel', description: 'Fond de teint fluide coverage naturelle, fini lumineux.', price: 39.00, category_id: 3, image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600', stock: 65, featured: 1, rating: 4.8 },
                { name: 'Poudre Libre Matifiante', description: 'Poudre libre ultra-fine pour un fini mat et naturel.', price: 34.00, category_id: 3, image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600', stock: 55, featured: 0, rating: 4.5 },
                { name: 'Eau de Parfum Floral', description: 'Eau de parfum aux notes florales délicates et féminines.', price: 78.00, category_id: 4, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600', stock: 35, featured: 1, rating: 4.9 },
                { name: 'Brume Parfumée Fraîcheur', description: 'Brume légère parfumée pour rafraîchir et parfumer toute la journée.', price: 35.00, category_id: 4, image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600', stock: 70, featured: 0, rating: 4.4 },
                { name: 'Set de Pinceaux Premium', description: 'Set de 12 pinceaux professionnels en fibres synthétiques douces.', price: 89.00, category_id: 5, image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600', stock: 25, featured: 1, rating: 4.8 },
                { name: 'Éponge Beauty Blender', description: 'Éponge de maquillage ergonomique pour un application parfaite.', price: 18.00, category_id: 5, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', stock: 150, featured: 0, rating: 4.6 }
            ];

            products.forEach(prod => {
                db.run(
                    `INSERT OR IGNORE INTO products (name, description, price, category_id, image, stock, featured, rating, reviews_count) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [prod.name, prod.description, prod.price, prod.category_id, prod.image, prod.stock, prod.featured, prod.rating, Math.floor(Math.random() * 100)]
                );
            });

            console.log('✅ Données de démonstration insérées');
        }
    }, 100);
}

module.exports = db;
