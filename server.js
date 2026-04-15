require('dotenv').config();
const app = require('./app');
const config = require('./config');

const PORT = config.port;

// Démarrer le serveur
app.listen(PORT, () => {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║           🌸 ÉCLAT NATUREL - Beauty Shop 🌸              ║');
    console.log('║                                                           ║');
    console.log(`║   Serveur démarré sur http://localhost:${PORT}               ║');
    console.log('║                                                           ║');
    console.log('║   Mode: ' + config.nodeEnv.padEnd(42) + '║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
});