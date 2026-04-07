// Configuration file for the Resume Builder application
// Load environment variables from .env file

require('dotenv').config();

const config = {
    // Server Configuration
    server: {
        port: parseInt(process.env.PORT, 10) || 3000,
        env: process.env.NODE_ENV || 'development',
        isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
        isProduction: process.env.NODE_ENV === 'production',
    },

    // Database Configuration
    database: {
        mongoUri: process.env.MONGODB_URI || '',
        options: {
            // MongoDB driver 4.0+ doesn't require these options
        }
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    },

    // Security Configuration
    security: {
        corsEnabled: process.env.CORS_ENABLED !== 'false',
        trustProxy: process.env.TRUST_PROXY === 'true',
    },

    // Puppeteer Configuration (for PDF generation)
    puppeteer: {
        // Will automatically use the Puppeteer-installed browser
        // Or set PUPPETEER_EXECUTABLE_PATH env var to use a specific Chrome/Chromium
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        headless: true,
        timeout: 60000,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    },

    // Validation
    validate() {
        const errors = [];

        if (!this.database.mongoUri) {
            errors.push('MONGODB_URI is not set in environment variables');
        }

        if (errors.length > 0) {
            console.error('❌ Configuration errors:');
            errors.forEach(error => console.error(`  - ${error}`));
            process.exit(1);
        }

        return true;
    },

    // Logging utility
    log(message, level = 'info') {
        if (!this.isDevelopment && level === 'debug') return;
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
};

// Validate configuration on load
config.validate();

module.exports = config;
