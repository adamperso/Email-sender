// State management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let products = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    checkAuth();
    
    // Form listeners
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('checkoutForm')?.addEventListener('submit', handleCheckout);
});

// Navigation
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    const pageMap = {
        'home': 'homePage',
        'login': 'loginPage',
        'register': 'registerPage',
        'cart': 'cartPage',
        'checkout': 'checkoutPage',
        'confirmation': 'confirmationPage'
    };
    
    const targetPage = document.getElementById(pageMap[pageName]);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
    }
    
    // Load specific page data
    if (pageName === 'cart') renderCart();
    if (pageName === 'checkout') renderCheckout();
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Erreur chargement produits:', error);
        showToast('Erreur de chargement des produits', 'error');
    }
}

// Render products
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = products.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <span class="product-price">${product.price} €</span>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Ajouter au panier
                </button>
            </div>
        </div>
    `).join('');
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartCount();
    showToast(`${product.name} ajouté au panier`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
    showToast('Produit retiré du panier', 'success');
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        renderCart();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElement = document.getElementById('cartCount');
    if (countElement) {
        countElement.textContent = count;
        countElement.style.transform = count > 0 ? 'scale(1.2)' : 'scale(1)';
        setTimeout(() => countElement.style.transform = 'scale(1)', 200);
    }
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>Votre panier est vide</p></div>';
        document.getElementById('cartSubtotal').textContent = '0 €';
        document.getElementById('cartTotal').textContent = '0 €';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${item.price} €</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Supprimer</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartSubtotal').textContent = `${total} €`;
    document.getElementById('cartTotal').textContent = `${total} €`;
    if (checkoutBtn) checkoutBtn.disabled = false;
}

// Checkout
function renderCheckout() {
    if (!currentUser) {
        showToast('Veuillez vous connecter pour commander', 'error');
        showPage('login');
        return;
    }
    
    const orderSummaryItems = document.getElementById('orderSummaryItems');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (orderSummaryItems) {
        orderSummaryItems.innerHTML = cart.map(item => `
            <div class="order-item">
                <span>${item.name} x${item.quantity}</span>
                <span>${item.price * item.quantity} €</span>
            </div>
        `).join('');
    }
    
    document.getElementById('orderTotal').textContent = `${total} €`;
    document.getElementById('payAmount').textContent = `${total} €`;
}

// Auth functions
function checkAuth() {
    const navLogin = document.getElementById('navLogin');
    if (navLogin && currentUser) {
        navLogin.textContent = currentUser.name;
        navLogin.onclick = () => showPage('home');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('token', data.token);
            checkAuth();
            showToast('Connexion réussie!', 'success');
            showPage('home');
            document.getElementById('loginForm').reset();
        } else {
            showToast(data.error || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        showToast('Erreur de connexion', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Inscription réussie! Connectez-vous maintenant.', 'success');
            showPage('login');
            document.getElementById('registerForm').reset();
        } else {
            showToast(data.error || 'Erreur d\'inscription', 'error');
        }
    } catch (error) {
        showToast('Erreur d\'inscription', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    location.reload();
}

// Checkout handler
async function handleCheckout(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        showToast('Votre panier est vide', 'error');
        return;
    }
    
    const shippingInfo = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zipCode: document.getElementById('zipCode').value,
        email: document.getElementById('checkoutEmail').value
    };
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                items: cart,
                total,
                shippingInfo
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('orderNumber').textContent = `#${data.orderId}`;
            clearCart();
            showPage('confirmation');
            document.getElementById('checkoutForm').reset();
            showToast('Commande confirmée!', 'success');
        } else {
            showToast(data.error || 'Erreur lors de la commande', 'error');
        }
    } catch (error) {
        showToast('Erreur lors de la commande', 'error');
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format card number input
document.getElementById('cardNumber')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

// Format expiry date input
document.getElementById('expiryDate')?.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// CVV input - numbers only
document.getElementById('cvv')?.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});
