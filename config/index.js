require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    
    // Session Configuration
    session: {
        secret: process.env.SESSION_SECRET || 'session_secret_change_in_production',
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'strict'
        }
    },
    
    // Database Configuration
    database: {
        path: process.env.DATABASE_PATH || './data/beauty_shop.db'
    },
    
    // Stripe Configuration
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    },
    
    // Upload Configuration
    upload: {
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024, // 5MB
        path: process.env.UPLOAD_PATH || './data/images'
    }
};
