require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

// Import configuration and error handlers
const config = require('./config');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();

// Security middleware
app.use(helmet());

// Connect to MongoDB
mongoose.connect(config.database.mongoUri, config.database.options)
    .then(() => {
        config.log('MongoDB Connected successfully!', 'info');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));

// Static files (CSS, client-side JS)
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Production settings
if (config.server.isProduction) {
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
}

// Routes
app.use('/', resumeRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
const server = app.listen(config.server.port, () => {
    config.log(`🚀 Server is running on http://localhost:${config.server.port}`, 'info');
    config.log(`📝 Environment: ${config.server.env}`, 'info');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    config.log('SIGTERM signal received: closing HTTP server', 'warn');
    server.close(() => {
        config.log('HTTP server closed', 'info');
        mongoose.connection.close(false, () => {
            config.log('MongoDB connection closed', 'info');
            process.exit(0);
        });
    });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
