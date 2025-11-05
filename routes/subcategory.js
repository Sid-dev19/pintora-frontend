const express = require('express');
const router = express.Router();
const upload = require('./multer');
const supabase = require('../config/supabase');
const withRetry = require('./utils/withRetry');

// ==============================
// Helper Functions
// ==============================

// Normalize subcategory data
function processSubcategory(subcategory) {
    if (!subcategory) return null;

    return {
        id: subcategory.id || subcategory.subcategoryid,
        subcategoryid: subcategory.subcategoryid,
        categoryid: subcategory.categoryid,
        subcategoryname: subcategory.subcategoryname || '',
        subcategoryicon: subcategory.subcategoryicon || null,
        created_at: subcategory.created_at || new Date().toISOString(),
        updated_at: subcategory.updated_at || new Date().toISOString(),
        user_admin: subcategory.user_admin || null,
        categoryname: subcategory.categoryname || subcategory.category?.categoryname || ''
    };
}

// Centralized error response
function sendErrorResponse(res, error, defaultMessage = 'An error occurred') {
    console.error('Error:', error);

    const statusCode = error.statusCode || 500;
    const response = {
        success: false,
        message: error.message || defaultMessage,
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        response.error = {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        };
    }

    // Specific database error codes
    if (error.code === '23505') {
        response.message = 'A subcategory with this name already exists';
    } else if (error.code === '23503') {
        response.message = 'Invalid category reference';
    } else if (error.code === '42P01') {
        response.message = 'Database configuration error (missing tables)';
    }

    return res.status(statusCode).json(response);
}

// ==============================
// Routes
// ==============================

// Create Subcategory
router.post('/subcategory_submit', upload.single('subcategoryicon'), async (req, res) => {
    try {
        const { categoryid, subcategoryname, user_admin } = req.body;

        if (!categoryid || !subcategoryname) {
            return res.status(400).json({
                success: false,
                message: 'Category ID and Subcategory name are required',
                fields: { categoryid, subcategoryname },
                timestamp: new Date().toISOString()
            });
        }

        const subcategoryData = {
            categoryid,
            subcategoryname: subcategoryname.trim(),
            subcategoryicon: req.file ? req.file.filename : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_admin: user_admin || null
        };

        const { data, error } = await withRetry(async () => {
            const result = await supabase
                .from('subcategory')
                .insert([subcategoryData])
                .select();
            if (result.error) throw result.error;
            return result;
        });

        if (error) throw error;

        const created = processSubcategory(data[0]);

        // Fetch category name
        const { data: category } = await supabase
            .from('category')
            .select('categoryname')
            .eq('categoryid', created.categoryid)
            .single();

        if (category) created.categoryname = category.categoryname;

        res.status(201).json({
            success: true,
            message: 'Subcategory created successfully',
            data: created,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to create subcategory');
    }
});

// Update Subcategory (without icon)
router.post('/edit_subcategory_data', async (req, res) => {
    try {
        const { subcategoryid, categoryid, subcategoryname, user_admin } = req.body;

        if (!subcategoryid || !categoryid || !subcategoryname) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory ID, Category ID, and Subcategory name are required',
                timestamp: new Date().toISOString()
            });
        }

        const updateData = {
            categoryid,
            subcategoryname: subcategoryname.trim(),
            updated_at: new Date().toISOString(),
            user_admin: user_admin || null
        };

        const { data, error } = await withRetry(async () => {
            const result = await supabase
                .from('subcategory')
                .update(updateData)
                .eq('subcategoryid', subcategoryid)
                .select();
            if (result.error) throw result.error;
            return result;
        });

        if (error) throw error;
        if (!data || data.length === 0)
            return res.status(404).json({ success: false, message: 'Subcategory not found' });

        const updated = processSubcategory(data[0]);

        // Fetch category name
        const { data: category } = await supabase
            .from('category')
            .select('categoryname')
            .eq('categoryid', updated.categoryid)
            .single();

        if (category) updated.categoryname = category.categoryname;

        res.status(200).json({
            success: true,
            message: 'Subcategory updated successfully',
            data: updated,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to update subcategory');
    }
});

// Update Subcategory Icon
router.post('/edit_subcategory_icon', upload.single('subcategoryicon'), async (req, res) => {
    try {
        const { subcategoryid, user_admin } = req.body;
        if (!subcategoryid) return res.status(400).json({ success: false, message: 'Subcategory ID is required' });
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        const { data, error } = await withRetry(async () => {
            const result = await supabase
                .from('subcategory')
                .update({
                    subcategoryicon: req.file.filename,
                    updated_at: new Date().toISOString(),
                    user_admin: user_admin || null
                })
                .eq('subcategoryid', subcategoryid)
                .select();
            if (result.error) throw result.error;
            return result;
        });

        if (error) throw error;
        if (!data || data.length === 0)
            return res.status(404).json({ success: false, message: 'Subcategory not found' });

        const updated = processSubcategory(data[0]);

        // Fetch category name
        const { data: category } = await supabase
            .from('category')
            .select('categoryname')
            .eq('categoryid', updated.categoryid)
            .single();

        if (category) updated.categoryname = category.categoryname;

        res.status(200).json({
            success: true,
            message: 'Subcategory icon updated successfully',
            data: updated,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to update subcategory icon');
    }
});

// Delete Subcategory
router.post('/delete_subcategory', async (req, res) => {
    try {
        const { subcategoryid } = req.body;
        if (!subcategoryid)
            return res.status(400).json({ success: false, message: 'Subcategory ID is required' });

        const { data: subcategory, error: fetchError } = await withRetry(() =>
            supabase.from('subcategory').select('*').eq('subcategoryid', subcategoryid).single()
        );

        if (fetchError) throw fetchError;
        if (!subcategory)
            return res.status(404).json({ success: false, message: 'Subcategory not found' });

        const { error: deleteError } = await withRetry(() =>
            supabase.from('subcategory').delete().eq('subcategoryid', subcategoryid)
        );
        if (deleteError) throw deleteError;

        res.status(200).json({
            success: true,
            message: 'Subcategory deleted successfully',
            data: processSubcategory(subcategory),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to delete subcategory');
    }
});

// Get All Subcategories (with Category Names)
router.get('/display_all_subcategory', async (req, res) => {
    try {
        const { data: subcategories, error } = await withRetry(async () => {
            const result = await supabase.from('subcategory').select('*').order('subcategoryname', { ascending: true });
            if (result.error) throw result.error;
            return result;
        });

        if (error) throw error;

        if (!subcategories || subcategories.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No subcategories found',
                data: [],
                count: 0,
                timestamp: new Date().toISOString()
            });
        }

        const categoryIds = [...new Set(subcategories.map(sc => sc.categoryid))];
        const { data: categories } = await supabase
            .from('category')
            .select('categoryid, categoryname')
            .in('categoryid', categoryIds);

        const categoryMap = new Map(categories.map(cat => [cat.categoryid, cat.categoryname]));
        const processed = subcategories.map(sc => ({
            ...processSubcategory(sc),
            categoryname: categoryMap.get(sc.categoryid) || ''
        }));

        res.status(200).json({
            success: true,
            message: 'Subcategories retrieved successfully',
            data: processed,
            count: processed.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to retrieve subcategories');
    }
});

// Get Subcategories by Category ID
router.post('/get_all_subcategory_by_categoryid', async (req, res) => {
    try {
        const { categoryid } = req.body;
        if (!categoryid)
            return res.status(400).json({ success: false, message: 'Category ID is required' });

        const { data: subcategories, error } = await withRetry(async () => {
            const result = await supabase
                .from('subcategory')
                .select('*')
                .eq('categoryid', categoryid)
                .order('subcategoryname', { ascending: true });
            if (result.error) throw result.error;
            return result;
        });

        if (error) throw error;

        const { data: category } = await supabase
            .from('category')
            .select('categoryname')
            .eq('categoryid', categoryid)
            .single();

        const processed = subcategories.map(sc => ({
            ...processSubcategory(sc),
            categoryname: category?.categoryname || ''
        }));

        res.status(200).json({
            success: true,
            message: 'Subcategories retrieved successfully',
            data: processed,
            count: processed.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to retrieve subcategories by category');
    }
});

// Get Subcategory by ID
router.get('/get_subcategory/:id', async (req, res) => {
    try {
        const subcategoryId = req.params.id;
        if (!subcategoryId)
            return res.status(400).json({ success: false, message: 'Subcategory ID is required' });

        const { data: subcategory, error } = await withRetry(async () => {
            const result = await supabase
                .from('subcategory')
                .select('*')
                .eq('subcategoryid', subcategoryId)
                .single();
            if (result.error && result.error.code !== 'PGRST116') throw result.error;
            return result;
        });

        if (error) throw error;
        if (!subcategory)
            return res.status(404).json({ success: false, message: 'Subcategory not found' });

        const processed = processSubcategory(subcategory);

        const { data: category } = await supabase
            .from('category')
            .select('categoryname')
            .eq('categoryid', processed.categoryid)
            .single();

        if (category) processed.categoryname = category.categoryname;

        res.status(200).json({
            success: true,
            message: 'Subcategory retrieved successfully',
            data: processed,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to retrieve subcategory');
    }
});

module.exports = router;
