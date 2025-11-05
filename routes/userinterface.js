const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const path = require('path');

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Input validation middleware
const validateUserInput = (req, res, next) => {
    const { firstname, lastname, email, phone, password } = req.body;
    
    if (!firstname || !lastname || !email || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required',
            required: ['firstname', 'lastname', 'email', 'phone', 'password']
        });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        });
    }
    
    // Basic phone validation (adjust based on your requirements)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format. Must be 10-15 digits.'
        });
    }
    
    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// Apply error handling middleware
router.use(errorHandler);

// Helper function to execute Supabase queries with retry logic
async function withRetry(operation, maxRetries = MAX_RETRIES, delay = RETRY_DELAY) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await operation();
            return result;
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }
    
    throw lastError || new Error('Operation failed after maximum retries');
}

// Request timeout configuration
const SUPABASE_TIMEOUT = 10000; // 10 seconds

// Create a custom fetch with timeout
const fetchWithTimeout = (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT);

    return fetch(url, {
        ...options,
        signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
};

// Configure Supabase client
if (supabase) {
    supabase.realtime.setAuth({
        fetch: fetchWithTimeout
    });
}

/**
 * @route   POST /api/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateUserInput, async (req, res) => {
    try {
        const { firstname, lastname, email, phone, password } = req.body;
        
        // Check if user already exists
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${email},phone.eq.${phone}`)
            .maybeSingle();

        if (userError) throw userError;
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email or phone'
            });
        }

        // Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstname,
                    last_name: lastname,
                    phone
                }
            }
        });

        if (authError) throw authError;

        // Create user profile in database
        const { data: newUser, error: dbError } = await supabase
            .from('users')
            .insert([
                {
                    id: authUser.user.id,
                    email,
                    phone,
                    first_name: firstname,
                    last_name: lastname,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (dbError) throw dbError;

        // Generate JWT token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                phone: newUser.phone
            },
            token: session.access_token
        });

    } catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
});

/**
 * @route   POST /api/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Authenticate user with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            throw error;
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) throw profileError;

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: userProfile.id,
                email: userProfile.email,
                first_name: userProfile.first_name,
                last_name: userProfile.last_name,
                phone: userProfile.phone
            },
            token: data.session.access_token
        });

    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
});

/**
 * @route   GET /api/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token and get user
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        res.json({
            success: true,
            user: {
                id: profile.id,
                email: profile.email,
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone: profile.phone,
                created_at: profile.created_at,
                updated_at: profile.updated_at
            }
        });

    } catch (error) {
        console.error('Profile error:', error);
        next(error);
    }
});

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
            
        if (error) throw error;
        
        res.status(200).json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            error: 'Database connection failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/profile/update
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile/update', async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const { first_name, last_name, phone } = req.body;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Update user profile
        const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .update({
                first_name,
                last_name,
                phone,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedProfile.id,
                email: updatedProfile.email,
                first_name: updatedProfile.first_name,
                last_name: updatedProfile.last_name,
                phone: updatedProfile.phone
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        next(error);
    }
});

/**
 * @route   POST /api/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        next(error);
    }
});

// Error handling middleware (should be the last middleware)
router.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Backward compatibility for old /submit_user_data endpoint
router.post('/submit_user_data', async (req, res, next) => {
    console.log('Legacy endpoint called:', req.originalUrl);
    
    try {
        // Map old request body to new format
        const { firstname, lastname, gender, emailaddress, dob, mobileno, password = 'defaultPassword123!' } = req.body;
        
        if (!firstname || !lastname || !emailaddress || !mobileno) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['firstname', 'lastname', 'emailaddress', 'mobileno']
            });
        }

        // Check if user already exists
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${emailaddress},phone.eq.${mobileno}`)
            .maybeSingle();

        if (userError) throw userError;
        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists with this email or phone',
                status: false
            });
        }

        // Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email: emailaddress,
            password: password || `Zep${mobileno}@123`,
            options: {
                data: {
                    first_name: firstname,
                    last_name: lastname,
                    phone: mobileno
                }
            }
        });

        if (authError) throw authError;

        // Create user profile in database
        const { data: newUser, error: dbError } = await supabase
            .from('users')
            .insert([
                {
                    id: authUser.user.id,
                    email: emailaddress,
                    phone: mobileno,
                    first_name: firstname,
                    last_name: lastname,
                    gender: gender,
                    dob: dob,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (dbError) throw dbError;

        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // Return response in legacy format
        res.status(200).json({
            message: 'Successfully registered',
            status: true,
            userid: newUser.id,
            userData: {
                firstname: newUser.first_name,
                lastname: newUser.last_name,
                email: newUser.email,
                phone: newUser.phone,
                gender: newUser.gender,
                dob: newUser.dob
            }
        });

    } catch (error) {
        console.error('Legacy registration error:', error);
        
        // Handle specific error cases
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                message: 'User with this email or phone already exists',
                status: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            message: 'Registration failed',
            status: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /userinterface/check_user_mobileno
 * @desc    Check if a mobile number exists in the system
 * @access  Public
 */
// This endpoint is deprecated - using the one below that uses the correct table name

// 404 handler (keep this last)
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl
    });
});

module.exports = router;

// Helper function to parse filenames from various formats
function parseFilenames(filenames) {
    if (!filenames) return [];
    
    // If it's already an array, return it directly
    if (Array.isArray(filenames)) return filenames;
    
    // Try to parse as JSON
    try {
        const parsed = JSON.parse(String(filenames).trim());
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        // If parsing as JSON fails, try splitting by comma
        if (typeof filenames === 'string') {
            return filenames.split(',')
                .map(f => f.trim())
                .filter(f => f.length > 0);
        }
        return [];
    }
}

/**
 * @route GET /show_all_banner
 * @description Get all active banners
 * @access Public
 */
router.get('/show_all_banner', async (req, res) => {
    try {
        // Try to get column info first to handle different schemas
        let sortField = null;
        let hasStatusFilter = true;
        
        // First try to get one banner to check available columns
        const { data: sample, error: sampleError } = await withRetry(async () => {
            const result = await supabase
                .from('mainbanner')
                .select('*')
                .limit(1)
                .maybeSingle();
            if (result.error) throw result.error;
            return result;
        });
        
        if (sampleError) {
            console.warn('Error checking table structure, trying fallback:', sampleError.message);
            hasStatusFilter = false;
        } else if (sample) {
            // Check if status column exists and has meaningful values
            if (!('status' in sample) || !['show', 'hide'].includes(sample.status)) {
                hasStatusFilter = false;
            }
            
            // Try to find a suitable sort field
            const possibleSortFields = ['created_at', 'date_created', 'banner_order', 'id', 'banner_id'];
            sortField = possibleSortFields.find(field => field in sample) || Object.keys(sample)[0];
        }
        
        // Build the base query
        let query = supabase.from('mainbanner').select('*');
        
        // Add status filter if applicable
        if (hasStatusFilter) {
            query = query.eq('status', 'show');
        }
        
        // Add sorting if we found a sort field
        if (sortField) {
            query = query.order(sortField, { ascending: true });
        }
        
        // Execute the query with retry
        const { data: banners, error } = await withRetry(async () => {
            const result = await query;
            if (result.error) throw result.error;
            return result;
        });
        
        if (error) {
            console.error('Error fetching banners, trying fallback:', error);
            // Try one more time with the most basic query possible
            const { data: fallbackBanners, error: fallbackError } = await withRetry(async () => {
                const result = await supabase
                    .from('mainbanner')
                    .select('*');
                if (result.error) throw result.error;
                return result;
            });
            
            if (fallbackError) throw fallbackError;
            
            return res.status(200).json({
                message: 'Success (using fallback query)',
                data: processBannerData(fallbackBanners || []),
                status: true
            });
        }
        
        res.status(200).json({ 
            message: 'Success', 
            data: processBannerData(banners || []), 
            status: true,
            meta: {
                count: Array.isArray(banners) ? banners.length : 0,
                hasStatusFilter,
                sortField: sortField || 'none'
            }
        });
        
    } catch (e) {
        console.error('Error in /show_all_banner:', e);
        
        // Return a fallback response if database is down
        const fallbackResponse = {
            message: 'Service temporarily unavailable',
            status: false,
            error: 'Database connection error',
            fallback: true,
            timestamp: new Date().toISOString()
        };
        
        // Add more details in development
        if (process.env.NODE_ENV === 'development') {
            fallbackResponse.details = {
                message: e.message,
                code: e.code,
                name: e.name
            };
        }
        
        res.status(503).json(fallbackResponse);
    }
});

// Helper function to process banner data with safe property access
function processBannerData(banners) {
    return banners.map(banner => {
        const safeGet = (obj, prop, defaultValue = null) => {
            try {
                return obj && (prop in obj) ? obj[prop] : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        };
        
        // Get image fields, trying multiple possible field names
        const imageFields = ['filenames', 'images', 'image_url', 'banner_image'];
        let imageValue = '';
        for (const field of imageFields) {
            if (field in banner) {
                imageValue = banner[field];
                break;
            }
        }
        
        return {
            id: safeGet(banner, 'id') || safeGet(banner, 'banner_id') || Math.random().toString(36).substr(2, 9),
            title: safeGet(banner, 'title', 'Untitled Banner'),
            description: safeGet(banner, 'description', ''),
            status: safeGet(banner, 'status', 'show'),
            created_at: safeGet(banner, 'created_at') || new Date().toISOString(),
            updated_at: safeGet(banner, 'updated_at') || new Date().toISOString(),
            filenames: parseFilenames(imageValue),
            // Include all other fields that might be present
            ...Object.entries(banner || {}).reduce((acc, [key, value]) => {
                if (!['id', 'title', 'description', 'status', 
                      'created_at', 'updated_at', 'filenames', 
                      'images', 'image_url', 'banner_image'].includes(key)) {
                    acc[key] = value;
                }
                return acc;
            }, {})
        };
    });
}

/**
 * @route GET /show_all_bankoffer
 * @description Get bank offers with filtering and pagination
 * @access Public
 * @query {string} [status=show] - Filter by status (e.g., 'show', 'hidden')
 * @query {string} [type] - Filter by offer type (e.g., 'bank', 'credit_card', 'loan')
 * @query {number} [page=1] - Page number for pagination
 * @query {number} [limit=10] - Number of items per page
 * @query {string} [sortBy=created_at] - Field to sort by
 * @query {string} [sortOrder=desc] - Sort order ('asc' or 'desc')
 */
router.get('/show_all_bankoffer', async (req, res) => {
    try {
        // Parse query parameters with defaults
        const {
            status = 'show',
            type,
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        // Validate pagination parameters
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Build the base query
        let query = supabase
            .from('bankandotheroffers')
            .select('*', { count: 'exact' });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (type) {
            query = query.eq('offer_type', type);
        }

        // Get total count for pagination
        const { count, error: countError } = await query;
        if (countError) {
            console.warn('Error getting count, continuing without pagination info:', countError.message);
        }

        // Try to get column info to determine available columns
        let sortField = null;
        let hasPagination = true;
        
        try {
            // Try to get one record to check available columns
            const { data: sample, error: sampleError } = await supabase
                .from('bankandotheroffers')
                .select('*')
                .limit(1)
                .maybeSingle();

            if (sampleError) throw sampleError;
            
            if (sample) {
                // Try to find a suitable sort field
                const possibleSortFields = ['created_at', 'date_created', 'offer_date', 'id', 'offer_id'];
                sortField = possibleSortFields.find(field => field in sample) || Object.keys(sample)[0];
            }
        } catch (e) {
            console.warn('Could not determine table structure, using no sort:', e.message);
            hasPagination = false;
        }

        // Apply sorting if we found a sort field
        if (sortField) {
            query = query.order(sortField, { ascending: sortOrder === 'asc' });
        }
        
        // Only apply range if we're doing pagination
        if (hasPagination) {
            query = query.range(offset, offset + limitNum - 1);
        }

        // Execute the query
        const { data: offers, error } = await query;
        if (error) {
            console.error('Error fetching offers:', error);
            // Try one more time without any sorting/pagination
            const { data: retryData, error: retryError } = await supabase
                .from('bankandotheroffers')
                .select('*');
                
            if (retryError) {
                console.error('Retry failed:', retryError);
                throw new Error('Failed to fetch offers. Please check the database connection.');
            }
            
            return res.status(200).json({
                message: 'Success (using fallback query)',
                data: retryData || [],
                meta: {},
                status: true
            });
        }

        // Process the offers with safe property access
        const processedOffers = (offers || []).map(offer => {
            // Create a safe getter that won't throw for missing properties
            const safeGet = (obj, prop, defaultValue = null) => {
                try {
                    return obj && (prop in obj) ? obj[prop] : defaultValue;
                } catch (e) {
                    return defaultValue;
                }
            };

            return {
                id: safeGet(offer, 'id') || safeGet(offer, 'offer_id') || Math.random().toString(36).substr(2, 9),
                title: safeGet(offer, 'title', 'Untitled Offer'),
                description: safeGet(offer, 'description', ''),
                offer_type: safeGet(offer, 'offer_type') || safeGet(offer, 'type') || 'general',
                discount: safeGet(offer, 'discount', 0),
                code: safeGet(offer, 'code', ''),
                valid_from: safeGet(offer, 'valid_from'),
                valid_until: safeGet(offer, 'valid_until'),
                terms_conditions: safeGet(offer, 'terms_conditions', ''),
                status: safeGet(offer, 'status', 'active'),
                created_at: safeGet(offer, 'created_at') || new Date().toISOString(),
                updated_at: safeGet(offer, 'updated_at') || new Date().toISOString(),
                filenames: parseFilenames(safeGet(offer, 'filenames') || safeGet(offer, 'images') || ''),
                // Include all other fields that might be present
                ...Object.entries(offer || {}).reduce((acc, [key, value]) => {
                    if (!['id', 'title', 'description', 'offer_type', 'discount', 
                          'code', 'valid_from', 'valid_until', 'terms_conditions', 
                          'status', 'created_at', 'updated_at', 'filenames'].includes(key)) {
                        acc[key] = value;
                    }
                    return acc;
                }, {})
            };
        });

        // Calculate pagination metadata if we have count
        const meta = {};
        if (typeof count !== 'undefined') {
            const totalPages = Math.ceil((count || 0) / limitNum);
            meta.currentPage = pageNum;
            meta.itemsPerPage = limitNum;
            meta.totalItems = count || 0;
            meta.totalPages = totalPages;
            meta.hasNextPage = pageNum < totalPages;
            meta.hasPreviousPage = pageNum > 1;
        }

        res.status(200).json({
            message: 'Success' + (!hasPagination ? ' (no pagination)' : ''),
            data: processedOffers,
            meta,
            status: true
        });
    } catch (e) {
        console.error('Error fetching bank offers:', e);
        res.status(500).json({
            message: 'Server Error: ' + (e.message || 'An unexpected error occurred'),
            status: false,
            error: process.env.NODE_ENV === 'development' ? e.message : undefined
        });
    }
});

/**
 * @route GET /show_all_bankoffer/types
 * @description Get all available bank offer types
 * @access Public
 */
router.get('/show_all_bankoffer/types', async (req, res) => {
    try {
        // First try to get distinct offer types
        let { data, error } = await supabase
            .from('bankandotheroffers')
            .select('offer_type')
            .not('offer_type', 'is', null);

        let types = [];
        
        if (error) {
            console.warn('Error getting distinct types, trying fallback:', error.message);
            // Fallback: Get all records and process in memory
            const { data: allOffers, error: fetchError } = await supabase
                .from('bankandotheroffers')
                .select('*')
                .limit(1000); // Safety limit
                
            if (fetchError) throw fetchError;
            
            // Extract unique offer types from all fields that might contain type info
            const typeFields = ['offer_type', 'type', 'category'];
            types = [...new Set(
                allOffers
                    .flatMap(offer => 
                        typeFields
                            .filter(field => offer[field])
                            .map(field => offer[field].toString().trim())
                    )
                    .filter(Boolean)
            )];
        } else {
            // Extract unique offer types from the direct query
            types = [...new Set(data.map(item => item.offer_type))].filter(Boolean);
        }

        // If we still don't have types, provide some defaults
        if (types.length === 0) {
            types = ['bank', 'credit_card', 'loan', 'investment'];
        }

        res.status(200).json({
            message: 'Success',
            data: types,
            status: true
        });
    } catch (e) {
        console.error('Error in /show_all_bankoffer/types:', e);
        // Return default types in case of error
        res.status(200).json({
            message: 'Using default types',
            data: ['bank', 'credit_card', 'loan', 'investment'],
            status: true
        });
    }
});

/**
 * @route GET /show_all_adoffers
 * @description Get all ad offers
 * @access Public
 */
router.get('/show_all_adoffers', async (req, res) => {
    try {
        // Try to get all ad offers
        let { data: offers, error } = await supabase
            .from('adoffers')
            .select('*');

        if (error) {
            console.warn('Error fetching ad offers:', error.message);
            // If there's an error, try with a simpler query
            const result = await supabase
                .from('adoffers')
                .select('*');
            offers = result.data;
            error = result.error;
        }

        if (error) throw error;

        // Process the offers
        const processedOffers = (offers || []).map(offer => ({
            ...offer,
            filenames: parseFilenames(offer.filenames)
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: processedOffers, 
            status: true 
        });
    } catch (e) {
        console.error('Error fetching ad offers:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route POST /display_all_productdetail_by_status
 * @description Get all product details by status
 * @access Public
 */
router.post('/display_all_productdetail_by_status', async (req, res) => {
    try {
        const { productstatus } = req.body;

        if (!productstatus) {
            return res.status(400).json({ 
                message: 'Product status is required', 
                status: false 
            });
        }

        // First get all product details with the given status
        const { data: productDetails, error: pdError } = await supabase
            .from('productdetails')
            .select('*')
            .eq('productstatus', productstatus);

        if (pdError) throw pdError;

        if (!productDetails || productDetails.length === 0) {
            return res.status(200).json({ 
                message: 'No products found', 
                data: [], 
                status: true 
            });
        }

        // Get all related data for joins
        const categoryIds = [...new Set(productDetails.map(pd => pd.categoryid))];
        const subcategoryIds = [...new Set(productDetails.map(pd => pd.subcategoryid))];
        const brandIds = [...new Set(productDetails.filter(pd => pd.brandid).map(pd => pd.brandid))];
        const productIds = [...new Set(productDetails.filter(pd => pd.productid).map(pd => pd.productid))];

        // Fetch related data in parallel
        const [
            { data: categories },
            { data: subcategories },
            { data: brands },
            { data: products }
        ] = await Promise.all([
            // Get categories
            categoryIds.length > 0 ? 
                supabase.from('category')
                    .select('categoryid, categoryname')
                    .in('categoryid', categoryIds) :
                Promise.resolve({ data: [] }),
            
            // Get subcategories
            subcategoryIds.length > 0 ?
                supabase.from('subcategory')
                    .select('subcategoryid, subcategoryname')
                    .in('subcategoryid', subcategoryIds) :
                Promise.resolve({ data: [] }),
            
            // Get brands
            brandIds.length > 0 ?
                supabase.from('brands')
                    .select('brandid, brandname')
                    .in('brandid', brandIds) :
                Promise.resolve({ data: [] }),
            
            // Get products
            productIds.length > 0 ?
                supabase.from('products')
                    .select('productid, productname')
                    .in('productid', productIds) :
                Promise.resolve({ data: [] })
        ]);

        // Create lookup maps
        const categoryMap = new Map(categories?.map(c => [c.categoryid, c.categoryname]));
        const subcategoryMap = new Map(subcategories?.map(s => [s.subcategoryid, s.subcategoryname]));
        const brandMap = new Map(brands?.map(b => [b.brandid, b.brandname]));
        const productMap = new Map(products?.map(p => [p.productid, p.productname]));

        // Process the results
        const result = productDetails.map(item => {
            // Safely parse any JSON fields
            const productpictures = parseFilenames(item.productpictures);
            
            return {
                ...item,
                categoryname: categoryMap.get(item.categoryid) || 'N/A',
                subcategoryname: subcategoryMap.get(item.subcategoryid) || 'N/A',
                brandname: brandMap.get(item.brandid) || 'N/A',
                productname: productMap.get(item.productid) || 'N/A',
                productpictures: productpictures
            };
        });

        res.status(200).json({
            message: 'Success',
            data: result,
            status: true
        });
    } catch (e) {
        console.error('Error in display_all_productdetail_by_status:', e);
        res.status(500).json({
            message: 'Server Error: ' + (e.message || 'Unknown error occurred'),
            status: false
        });
    }
});

router.post('/user_get_all_brand_by_subcategoryid', function (req, res, next) {

    try {
        pool.query('select B.* ,(select C.categoryname from category C where C.categoryid=B.categoryid) as categoryname,(select SC.subcategoryname from subcategory SC where SC.subcategoryid=B.subcategoryid) as subcategoryname from brands B where B.subcategoryid=?', [req.body.subcategoryid], function (error, result) {

            if (error) {

                res.status(200).json({ message: 'Database Error Pls contact with backend team...', status: false })
            }
            else {
                res.status(200).json({ message: ' Success', data: result, status: true })

            }
        })
    }
    catch (e) {
        console.log(error)
        res.status(200).json({ message: 'Severe Error on Server Pls contact with backend team...', status: false })
    }

});

router.post('/user_display_product_details_by_subcategory', async (req, res) => {
    try {
        const { subcategoryid } = req.body;
        
        if (!subcategoryid) {
            return res.status(400).json({
                message: 'Subcategory ID is required',
                status: false
            });
        }

        // Get product details for the subcategory
        const { data: productDetails, error: detailsError } = await supabase
            .from('productdetails')
            .select('*')
            .eq('subcategoryid', subcategoryid);

        if (detailsError) throw detailsError;

        if (!productDetails || productDetails.length === 0) {
            return res.status(200).json({
                message: 'No products found for this subcategory',
                data: [],
                status: true
            });
        }

        // Get all related data in parallel
        const [
            { data: categories },
            { data: subcategories },
            { data: brands },
            { data: products }
        ] = await Promise.all([
            supabase.from('category').select('categoryid, categoryname'),
            supabase.from('subcategory').select('subcategoryid, subcategoryname'),
            supabase.from('brands').select('brandid, brandname'),
            supabase.from('products').select('productid, productname')
        ]);

        // Create lookup maps
        const categoryMap = new Map(categories?.map(c => [c.categoryid, c.categoryname]));
        const subcategoryMap = new Map(subcategories?.map(s => [s.subcategoryid, s.subcategoryname]));
        const brandMap = new Map(brands?.map(b => [b.brandid, b.brandname]));
        const productMap = new Map(products?.map(p => [p.productid, p.productname]));

        // Process the results
        const result = productDetails.map(item => ({
            ...item,
            categoryname: categoryMap.get(item.categoryid) || 'N/A',
            subcategoryname: subcategoryMap.get(item.subcategoryid) || 'N/A',
            brandname: brandMap.get(item.brandid) || 'N/A',
            productname: productMap.get(item.productid) || 'N/A',
            productpictures: parseFilenames(item.productpictures)
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: result, 
            status: true 
        });
    } catch (e) {
        console.error('Error in user_display_product_details_by_subcategory:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + (e.message || 'Unknown error occurred'), 
            status: false 
        });
    }
});

router.post('/user_display_product_details_by_id', async (req, res) => {
    try {
        const { productid } = req.body;
        
        if (!productid) {
            return res.status(400).json({
                message: 'Product ID is required',
                status: false
            });
        }

        // Get product details by ID
        const { data: productDetails, error: detailsError } = await supabase
            .from('productdetails')
            .select('*')
            .eq('productid', productid);

        if (detailsError) throw detailsError;

        if (!productDetails || productDetails.length === 0) {
            return res.status(404).json({
                message: 'Product not found',
                status: false
            });
        }

        const product = productDetails[0];

        // Get related data in parallel
        const [
            { data: categories },
            { data: subcategories },
            { data: brands },
            { data: products }
        ] = await Promise.all([
            supabase.from('category')
                .select('categoryid, categoryname')
                .eq('categoryid', product.categoryid),
            supabase.from('subcategory')
                .select('subcategoryid, subcategoryname')
                .eq('subcategoryid', product.subcategoryid),
            product.brandid ? 
                supabase.from('brands')
                    .select('brandid, brandname')
                    .eq('brandid', product.brandid) :
                Promise.resolve({ data: [] }),
            supabase.from('products')
                .select('productid, productname')
                .eq('productid', product.productid)
        ]);

        // Prepare the response
        const response = {
            ...product,
            categoryname: categories?.[0]?.categoryname || 'N/A',
            subcategoryname: subcategories?.[0]?.subcategoryname || 'N/A',
            brandname: brands?.[0]?.brandname || 'N/A',
            productname: products?.[0]?.productname || 'N/A',
            productpictures: parseFilenames(product.productpictures)
        };

        res.status(200).json({ 
            message: 'Success', 
            data: response, 
            status: true 
        });
    } catch (e) {
        console.error('Error in user_display_product_details_by_id:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + (e.message || 'Unknown error occurred'), 
            status: false 
        });
    }
});

router.post('/user_display_product_picture', async (req, res) => {
    try {
        const { productdetailid } = req.body;
        
        if (!productdetailid) {
            return res.status(400).json({
                message: 'Product detail ID is required',
                status: false
            });
        }

        // Get product pictures by product detail ID
        const { data: pictures, error } = await supabase
            .from('productpictures')
            .select('*')
            .eq('productdetailid', productdetailid);

        if (error) throw error;

        // Process the pictures to handle any JSON fields
        const processedPictures = (pictures || []).map(picture => ({
            ...picture,
            filenames: parseFilenames(picture.filenames)
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: processedPictures, 
            status: true 
        });
    } catch (e) {
        console.error('Error in user_display_product_picture:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + (e.message || 'Unknown error occurred'), 
            status: false 
        });
    }
});

router.post('/check_user_mobileno', function (req, res, next) {
    console.log(req.body)
    try {
        pool.query('select * from usersdata where mobileno=?', [req.body.mobileno], function (error, result) {
            if (error) {
                res.status(500).json({ message: 'Database Error Pls contact with backend team...', status: false })
            }
            else {
                if (result.length == 1) {
                    res.status(200).json({ message: ' Mobile No Exist', data: result[0], status: true })
                }
                else {
                    res.status(200).json({ message: ' Mobile No Does Not Exist', data: [], status: false })
                }
            }
        })
    }
    catch (e) {
        res.status(200).json({ message: 'Severe Error on Server Pls contact with backend team...', status: false })
    }

});

router.post('/submit_user_data', async (req, res) => {
    console.log('=== New Registration Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
        // Input validation
        const { firstname, lastname, gender, emailaddress, dob, mobileno } = req.body;
        
        // Validate required fields
        const requiredFields = { firstname, lastname, gender, emailaddress, dob, mobileno };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);
            
        if (missingFields.length > 0) {
            console.error('Validation failed. Missing fields:', missingFields);
            return res.status(400).json({ 
                message: 'All fields are required', 
                status: false,
                missingFields,
                requiredFields: ['firstname', 'lastname', 'gender', 'emailaddress', 'dob', 'mobileno']
            });
        }

        // Normalize inputs
        const normalizedEmail = emailaddress.trim().toLowerCase();
        const normalizedMobile = mobileno.toString().trim();
        
        console.log('Checking for existing users with:');
        console.log('- Email:', normalizedEmail);
        console.log('- Mobile:', normalizedMobile);
        
        // Check for existing users with the same email or mobile
        const { data: existingUsers, error: checkError } = await supabase
            .from('usersdata')
            .select('userid, emailaddress, mobileno')
            .or(`emailaddress.eq.${normalizedEmail},mobileno.eq.${normalizedMobile}`);

        if (checkError) {
            console.error('Error checking for existing users:', {
                code: checkError.code,
                message: checkError.message,
                details: checkError.details
            });
            throw checkError;
        }

        if (existingUsers && existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            const isEmailMatch = existingUser.emailaddress === normalizedEmail;
            const conflictField = isEmailMatch ? 'email address' : 'mobile number';
            const conflictValue = isEmailMatch ? normalizedEmail : normalizedMobile;
            
            console.log('Conflict detected:', { conflictField, conflictValue });
                
            return res.status(409).json({
                message: `This ${conflictField} is already registered`,
                status: false,
                conflictField: conflictField.replace(' ', ''),
                conflictValue,
                existingUserId: existingUser.userid
            });
        }

        console.log('No conflicts found, preparing to create new user...');
        
        // Prepare user data with timestamps
        const now = new Date().toISOString();
        const userData = {
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            gender: gender.trim(),
            emailaddress: normalizedEmail,
            dob: dob,
            mobileno: normalizedMobile,
            createdat: now,
            updatedat: now
        };

        console.log('Attempting to insert new user:', userData);

        // Insert new user with explicit error handling
        try {
            const { data, error: insertError } = await supabase
                .from('usersdata')
                .insert([userData])
                .select('*');

            if (insertError) throw insertError;
            
            if (!data || data.length === 0) {
                throw new Error('No data returned after insert');
            }
            
            const newUser = data[0];
            console.log('User registered successfully:', { 
                userId: newUser.userid,
                email: newUser.emailaddress,
                mobile: newUser.mobileno 
            });
            
            return res.status(201).json({ 
                message: 'Successfully registered', 
                status: true,
                userId: newUser.userid,
                userData: newUser
            });
            
        } catch (insertError) {
            console.error('Insert operation failed:', {
                code: insertError.code,
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint
            });
            
            // Handle specific constraint violations
            if (insertError.code === '23505') {
                const conflictField = insertError.message.includes('emailaddress') 
                    ? 'email address' 
                    : 'mobile number';
                    
                return res.status(409).json({
                    message: `This ${conflictField} is already registered`,
                    status: false,
                    conflictField: conflictField.replace(' ', '')
                });
            }
            
            throw insertError; // Re-throw for the outer catch block
        }
        
    } catch (error) {
        console.error('=== Registration Failed ===');
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Default error response
        const errorResponse = {
            message: 'Failed to register user. Please try again later.',
            status: false
        };
        
        // Add more details in development
        if (process.env.NODE_ENV === 'development') {
            errorResponse.error = {
                message: error.message,
                code: error.code,
                details: error.details
            };
        }
        
        return res.status(500).json(errorResponse);
    } finally {
        console.log('=== End of Registration Request ===\n');
    }
});

router.post('/check_user_address', function (req, res, next) {
    // console.log(req.body)
    try {
        pool.query('select * from useraddress where userid=?', [req.body.userid], function (error, result) {
            if (error) {
                res.status(500).json({ message: 'Database Error Pls contact with backend team...', status: false })
            }
            else {
                if (result.length >= 1) {
                    res.status(200).json({ message: ' Address Found', data: result, status: true })
                }
                else {
                    res.status(200).json({ message: ' Address Not Found ', data: [], status: false })
                }
            }
        })
    }
    catch (e) {
        res.status(200).json({ message: 'Severe Error on Server Pls contact with backend team...', status: false })
    }

});

router.post('/submit_user_address', function (req, res, next) {
    // console.log(req.body)
    try {
        pool.query('insert into useraddress(userid, pincode, houseno, floorno, towerno, building, address, landmark, city, state) values(?,?,?,?,?,?,?,?,?,?)', [req.body.userid, req.body.pincode, req.body.houseno, req.body.floorno, req.body.towerno, req.body.building, req.body.address, req.body.landmark, req.body.city, req.body.state], function (error, result) {
            if (error) {
                // console.log('ollll',error);

                res.status(500).json({ message: 'Database Error Pls contact with backend team...', status: false })
            }
            else {

                res.status(200).json({ message: 'Address Successfull Submitted', status: true })
            }

        })
    }
    catch (e) {
        res.status(200).json({ message: 'Severe Error on Server Pls contact with backend team...', status: false, userid: result.insertId })
    }

});

router.post('/submit_user_orders', function (req, res, next) {
    console.log(req.body)
    try {
        pool.query('insert into orders(orderno, orderdate, productdetailsid, quantity, paymentstatus, deliverystatus, mobileno, emailaddress, address, username) values(?,?,?,?,?,?,?,?,?,?)', [req.body.orderno, req.body.orderdate, req.body.productdetailsid, req.body.quantity, req.body.paymentstatus, req.body.deliverystatus, req.body.mobileno, req.body.emailaddress, req.body.address, req.body.username], function (error, result) {
            if (error) {
                console.log('ollll', error);

                res.status(500).json({ message: 'Database Error Pls contact with backend team...', status: false })
            }
            else {

                res.status(200).json({ message: 'Orders Successfull Submitted', status: true })
            }

        })
    }
    catch (e) {
        res.status(200).json({ message: 'Severe Error on Server Pls contact with backend team...', status: false, userid: result.insertId })
    }

});

module.exports = router;