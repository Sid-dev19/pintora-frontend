const express = require('express');
const router = express.Router();
const { testConnection } = require('../services/supabase');

// Health check endpoint
router.get('/', async (req, res) => {
    try {
        // Test database connection
        const dbStatus = await testConnection();
        
        // Get memory usage
        const memoryUsage = process.memoryUsage();
        
        // Prepare response
        const status = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: dbStatus.connected ? 'Connected' : 'Disconnected',
            uptime: process.uptime(),
            memory: {
                rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
            },
            environment: process.env.NODE_ENV || 'development'
        };

        // If database connection failed, return 503 Service Unavailable
        if (!dbStatus.connected) {
            return res.status(503).json({
                ...status,
                status: 'Service Unavailable',
                error: dbStatus.error
            });
        }

        res.json(status);
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'Error',
            message: 'Health check failed',
            error: error.message
        });
    }
});

module.exports = router;
