const express = require('express');
const router = express.Router();
const upload = require('./multer');
const supabase = require('../config/supabase');
const withRetry = require('./utils/withRetry');

// Helper function to process category data
function processCategory(category) {
    if (!category) return null;
    return {
        id: category.id || category.categoryid,
        categoryid: category.categoryid,
        categoryname: category.categoryname,
        categoryicon: category.categoryicon,
        status: category.status || 'active',
        created_at: category.created_at || new Date().toISOString(),
        updated_at: category.updated_at || new Date().toISOString()
    };
}

// Helper function to send error responses
function sendErrorResponse(res, error, defaultMessage = 'An error occurred') {
    console.error('Error:', error);
    
    const statusCode = error.statusCode || 500;
    const response = {
        success: false,
        message: error.message || defaultMessage,
        timestamp: new Date().toISOString()
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.error = {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        };
    }

    // Handle specific error codes
    if (error.code === '23505') { // Unique violation
        response.message = 'A category with this name already exists';
    } else if (error.code === '42P01') { // Table doesn't exist
        response.message = 'Database configuration error';
        response.details = 'Required database tables are missing';
    }

    return res.status(statusCode).json(response);
}

// Create Category
router.post('/category_submit', upload.single('categoryicon'), async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.categoryname) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
                field: 'categoryname'
            });
        }

        const categoryData = {
            categoryname: req.body.categoryname.trim(),
            categoryicon: req.file ? req.file.filename : null,
            created_at: req.body.created_at || new Date().toISOString(),
            updated_at: req.body.updated_at || new Date().toISOString(),
            user_admin: req.body.user_admin || null
        };

        // Execute with retry logic
        const { data, error } = await withRetry(async () => {
            const result = await supabase
                .from('category')
                .insert([categoryData])
                .select();
            
            if (result.error) {
                const error = new Error(result.error.message);
                error.code = result.error.code;
                throw error;
            }
            
            return result;
        });

        if (error) throw error;

        // Success response
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: processCategory(data[0])
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to create category');
    }
});

// Get All Categories
router.get('/display_all_category', async (req, res) => {
    try {
        const { data: categories, error } = await withRetry(async () => {
            const result = await supabase
                .from('category')
                .select('*')
                .order('categoryname', { ascending: true });
            
            if (result.error) throw result.error;
            return result;
        });

        if (error) throw error;

        const processedCategories = (categories || []).map(processCategory);

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: processedCategories,
            count: processedCategories.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to retrieve categories');
    }
});

// Update Category (without icon)
router.post('/edit_category_data', async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.categoryid) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required',
                field: 'categoryid'
            });
        }

        if (!req.body.categoryname) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
                field: 'categoryname'
            });
        }

        const updateData = {
            categoryname: req.body.categoryname.trim(),
            updated_at: new Date().toISOString(),
            user_admin: req.body.user_admin || null
        };

        // Execute with retry logic
        const { data, error } = await withRetry(async () => {
            const result = await supabase
                .from('category')
                .update(updateData)
                .eq('categoryid', req.body.categoryid)
                .select();
            
            if (result.error) {
                const error = new Error(result.error.message);
                error.code = result.error.code;
                throw error;
            }
            
            return result;
        });

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
                categoryid: req.body.categoryid
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: processCategory(data[0]),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to update category');
    }
});

// Update Category Icon
router.post('/edit_category_icon', upload.single('categoryicon'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
                field: 'categoryicon'
            });
        }

        if (!req.body.categoryid) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required',
                field: 'categoryid'
            });
        }

        // Execute with retry logic
        const { data, error } = await withRetry(async () => {
            const result = await supabase
                .from('category')
                .update({
                    categoryicon: req.file.filename,
                    updated_at: new Date().toISOString(),
                    user_admin: req.body.user_admin || null
                })
                .eq('categoryid', req.body.categoryid)
                .select();
            
            if (result.error) {
                const error = new Error(result.error.message);
                error.code = result.error.code;
                throw error;
            }
            
            return result;
        });

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
                categoryid: req.body.categoryid
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category icon updated successfully',
            data: processCategory(data[0]),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to update category icon');
    }
});

// Delete Category
router.post('/delete_category', async (req, res) => {
    try {
        if (!req.body.categoryid) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required',
                field: 'categoryid'
            });
        }

        // First check if category exists
        const { data: category, error: checkError } = await withRetry(() => 
            supabase
                .from('category')
                .select('categoryid')
                .eq('categoryid', req.body.categoryid)
                .single()
        );

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
            throw checkError;
        }

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
                categoryid: req.body.categoryid
            });
        }

        // Delete the category with retry logic
        const { error: deleteError } = await withRetry(async () => {
            const result = await supabase
                .from('category')
                .delete()
                .eq('categoryid', req.body.categoryid);
            
            if (result.error) {
                const error = new Error(result.error.message);
                error.code = result.error.code;
                throw error;
            }
            
            return result;
        });

        if (deleteError) throw deleteError;

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            categoryid: req.body.categoryid,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to delete category');
    }
});

// Get Category by ID
router.get('/get_category/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required',
                field: 'id'
            });
        }

        const { data: category, error } = await withRetry(async () => {
            const result = await supabase
                .from('category')
                .select('*')
                .eq('categoryid', categoryId)
                .single();
            
            if (result.error && result.error.code !== 'PGRST116') { // Not found
                throw result.error;
            }
            
            return result;
        });

        if (error) throw error;

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
                categoryid: categoryId
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category retrieved successfully',
            data: processCategory(category),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to retrieve category');
    }
});

module.exports = router;