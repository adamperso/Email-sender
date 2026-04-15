// État global de l'application
const AppState = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    products: [],
    categories: [],
    currentPage: 'home',
    currentProduct: null
};

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialisation de l'application
async function initializeApp() {
    updateCartCount();
    updateAuthUI();
    await loadCategories();
    
    // Déterminer la page actuelle et charger les données appropriées
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
        await loadFeaturedProducts();
    } else if (path === '/shop' || path.startsWith('/category/')) {
        await loadShopPage();
    } else if (path.startsWith('/product/')) {
        const productId = path.split('/')[2];
        await loadProductDetail(productId);
    } else if (path === '/cart') {
        renderCartPage();
    } else if (path === '/account') {
        loadAccountPage();
    } else if (path === '/orders') {
        loadOrdersPage();
    }
    
    setupEventListeners();
}

// Charger les catégories
async function loadCategories() {
    try {
        const response = await fetch('/api/products/categories/all');
        const data = await response.json();
        AppState.categories = data.categories || [];
    } catch (error) {
        console.error('Erreur chargement catégories:', error);
    }
}

// Charger les produits en vedette pour la page d'accueil
async function loadFeaturedProducts() {
    try {
        const response = await fetch('/api/products?featured=true&limit=8');
        const data = await response.json();
        AppState.products = data.products || [];
        renderHomePage();
    } catch (error) {
        console.error('Erreur chargement produits:', error);
        showToast('Erreur de chargement des produits', 'error');
    }
}

// Charger la page boutique
async function loadShopPage() {
    try {
        const categoryId = window.location.pathname.split('/')[2];
        const url = categoryId 
            ? `/api/products?category=${categoryId}`
            : '/api/products';
        
        const response = await fetch(url);
        const data = await response.json();
        AppState.products = data.products || [];
        renderShopPage();
    } catch (error) {
        console.error('Erreur chargement boutique:', error);
    }
}

// Charger les détails d'un produit
async function loadProductDetail(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        
        if (data.product) {
            AppState.currentProduct = data.product;
            renderProductDetail(data);
        } else {
            showToast('Produit non trouvé', 'error');
            window.location.href = '/shop';
        }
    } catch (error) {
        console.error('Erreur chargement produit:', error);
        showToast('Erreur de chargement du produit', 'error');
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleSearch(e.target.value);
        });
    }
    
    // Filtres boutique
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => handleSort(e.target.value));
    }
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const count = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cartCount');
    if (countElement) {
        countElement.textContent = count;
        countElement.style.transform = count > 0 ? 'scale(1.2)' : 'scale(1)';
        setTimeout(() => countElement.style.transform = 'scale(1)', 200);
    }
    localStorage.setItem('cart', JSON.stringify(AppState.cart));
}

// Mettre à jour l'interface d'authentification
function updateAuthUI() {
    const navAccount = document.getElementById('navAccount');
    if (navAccount) {
        if (AppState.user) {
            navAccount.textContent = `Compte (${AppState.user.name})`;
        } else {
            navAccount.textContent = 'Connexion';
        }
    }
}

// Menu mobile
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Gestion de la recherche mobile
function handleMobileSearch(event) {
    if (event.key === 'Enter') {
        handleSearch(event.target.value);
    }
}

// Recherche de produits
async function handleSearch(query) {
    if (!query.trim()) return;
    
    try {
        const response = await fetch(`/api/products/search/${encodeURIComponent(query)}`);
        const data = await response.json();
        AppState.products = data.products || [];
        renderShopPage();
        window.location.href = '/shop';
    } catch (error) {
        console.error('Erreur recherche:', error);
    }
}

// Tri des produits
function handleSort(sortValue) {
    let sortedProducts = [...AppState.products];
    
    switch (sortValue) {
        case 'price_asc':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    AppState.products = sortedProducts;
    renderShopPage();
}

// Ajouter au panier
function addToCart(productId, quantity = 1) {
    const product = AppState.products.find(p => p.id === productId) || AppState.currentProduct;
    if (!product) return;
    
    const existingItem = AppState.cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        AppState.cart.push({ ...product, quantity });
    }
    
    updateCartCount();
    showToast(`${product.name} ajouté au panier`, 'success');
}

// Retirer du panier
function removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCartPage();
    showToast('Produit retiré du panier', 'success');
}

// Mettre à jour la quantité dans le panier
function updateQuantity(productId, change) {
    const item = AppState.cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartCount();
        renderCartPage();
    }
}

// Vider le panier
function clearCart() {
    AppState.cart = [];
    updateCartCount();
}

// Calculer le total du panier
function getCartTotal() {
    return AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
