const express = require('express');
const router = express.Router();
const upload = require('./multer');
const supabase = require('../config/supabase');

/**
 * @route POST /adoffers_submit
 * @description Submit ad offers with multiple images
 * @access Public
 */
router.post('/adoffers_submit', upload.any('offers'), async (req, res) => {
    try {
        // Validate request
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                message: 'Please upload at least one offer image', 
                status: false 
            });
        }

        // Extract filenames from uploaded files
        const filenames = req.files.map(file => file.filename);
        
        // Insert into Supabase
        const { data, error } = await supabase
            .from('adoffers')
            .insert([
                { 
                    categoryid: req.body.categoryid || null,
                    subcategoryid: req.body.subcategoryid || null,
                    brandid: req.body.brandid || null,
                    productid: req.body.productid || null,
                    productdetailid: req.body.productdetailid || null,
                    filenames: JSON.stringify(filenames),
                    created_at: req.body.created_at || new Date().toISOString(),
                    updated_at: req.body.updated_at || new Date().toISOString(),
                    user_admin: req.body.user_admin || null
                }
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                message: 'Database Error: ' + error.message, 
                status: false 
            });
        }

        res.status(201).json({ 
            message: 'Ad Offer Submitted Successfully', 
            data: data[0],
            status: true 
        });
    } catch (e) {
        console.error('Server error:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route GET /adoffers
 * @description Get all ad offers with optional filtering
 * @access Public
 */
router.get('/adoffers', async (req, res) => {
    try {
        let query = supabase
            .from('adoffers')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters if provided
        if (req.query.categoryid) {
            query = query.eq('categoryid', req.query.categoryid);
        }
        if (req.query.subcategoryid) {
            query = query.eq('subcategoryid', req.query.subcategoryid);
        }
        if (req.query.brandid) {
            query = query.eq('brandid', req.query.brandid);
        }
        if (req.query.productid) {
            query = query.eq('productid', req.query.productid);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Parse the filenames from JSON string to array
        const offers = data.map(offer => ({
            ...offer,
            filenames: offer.filenames ? JSON.parse(offer.filenames) : []
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: offers, 
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
 * @route GET /adoffers/:id
 * @description Get a single ad offer by ID
 * @access Public
 */
router.get('/adoffers/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('adoffers')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ 
                message: 'Ad offer not found', 
                status: false 
            });
        }

        // Parse the filenames from JSON string to array
        const offer = {
            ...data,
            filenames: data.filenames ? JSON.parse(data.filenames) : []
        };

        res.status(200).json({ 
            message: 'Success', 
            data: offer, 
            status: true 
        });
    } catch (e) {
        console.error('Error fetching ad offer:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route DELETE /adoffers/:id
 * @description Delete an ad offer by ID
 * @access Public
 */
router.delete('/adoffers/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('adoffers')
            .delete()
            .eq('id', req.params.id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                message: 'Ad offer not found', 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Ad offer deleted successfully', 
            data: data[0],
            status: true 
        });
    } catch (e) {
        console.error('Error deleting ad offer:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

module.exports = router;