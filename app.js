require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
var createError = require('http-errors');
var express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  'https://trzhuqajzjkhmljrezoi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyemh1cWFqempraG1sanJlem9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDc0NjYsImV4cCI6MjA3NDgyMzQ2Nn0.aVrCv8BJqW4PpQXkWNBKDL_jwx3avJcgYaRgWLnra8o'
);
var path = require('path');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var categoryRouter = require('./routes/category')
var subcategoryRouter = require('./routes/subcategory')
var brandRouter = require('./routes/brand')
var productRouter = require('./routes/product')
var productdetailRouter = require('./routes/productdetail')
var productpictureRouter = require('./routes/productpictures')
var mainbannerRouter = require('./routes/mainbanner')
var adoffersRouter = require('./routes/adoffers')
var bankandotherofferRouter = require('./routes/bankandotheroffer')
var adminloginRouter = require('./routes/adminlogin')
var userinterfaceRouter = require('./routes/userinterface')
var smsRouter = require('./routes/smsapi')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
// Configure CORS to allow requests from React frontend
const corsOptions = {
  origin: 'http://localhost:3000', // React's default port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const healthRouter = require('./routes/health');

// Mount API routes
app.use('/category', categoryRouter);  // Changed from /api/categories to /category
app.use('/api/subcategories', subcategoryRouter);
app.use('/api/brands', brandRouter);
app.use('/api/products', productRouter);
app.use('/api/product-details', productdetailRouter);
app.use('/api/product-pictures', productpictureRouter);
app.use('/api/banners', mainbannerRouter);
app.use('/api/offers', adoffersRouter);
app.use('/api/bank-offers', bankandotherofferRouter);
app.use('/api/admin', adminloginRouter);
app.use('/api/user', userinterfaceRouter);
app.use('/api/sms', smsRouter);

// Health check route
app.use('/health', healthRouter);

// Default route
app.use('/', indexRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { error: err.message, stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Not Found'
    });
});
app.use('/users', usersRouter);
app.use('/category', categoryRouter)
app.use('/subcategory', subcategoryRouter)
app.use('/brand', brandRouter)
app.use('/product', productRouter)
app.use('/productdetail', productdetailRouter)
app.use('/productpicture', productpictureRouter)
app.use('/mainbanner', mainbannerRouter)
app.use('/adoffers', adoffersRouter)
app.use('/bankandotheroffer', bankandotherofferRouter)
app.use('/adminlogin', adminloginRouter)
app.use('/userinterface', userinterfaceRouter)
app.use('/sms', smsRouter);

// Debug all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// List all registered routes
const printRoutes = () => {
  console.log('\n--- Registered Routes ---');
  app._router.stack
    .filter(r => r.route)
    .map(r => {
      const methods = Object.keys(r.route.methods).join(',').toUpperCase();
      console.log(`${methods.padEnd(6)} ${r.route.path}`);
    });
  console.log('------------------------\n');
};

// Print routes when server starts
app.on('listening', () => {
  printRoutes();
});

// Test Supabase connection
app.get('/test-supabase', async (req, res) => {
  console.log('\n--- Testing Supabase Connection ---');
  
  try {
    // Test the connection by querying the products table
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Successfully connected to Supabase!',
      data: data,
      config: {
        url: 'https://trzhuqajzjkhmljrezoi.supabase.co',
        key: '***' + 'ra8o' // Last 4 chars of the key
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // Log the error details
  console.error('\n--- ERROR ---');
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack);
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  console.error('Request Body:', req.body);
  console.error('--- END ERROR ---\n');

  // Send JSON response for API errors
  if (req.xhr || req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      success: false,
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Set locals for EJS rendering
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n--- UNCAUGHT EXCEPTION ---');
  console.error(error);
  console.error('--- END UNCAUGHT EXCEPTION ---\n');
  // Consider graceful shutdown in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n--- UNHANDLED REJECTION ---');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  console.error('--- END UNHANDLED REJECTION ---\n');
});

module.exports = app;
