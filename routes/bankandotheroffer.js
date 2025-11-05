const express = require('express');
const router = express.Router();
const upload = require('./multer');
const supabase = require('../config/supabase');

/**
 * @route POST /bankandotheroffer_submit
 * @description Submit bank and other offers with multiple images
 * @access Public
 */
router.post('/bankandotheroffer_submit', upload.any('offers'), async (req, res) => {
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
            .from('bankandotheroffers')
            .insert([
                { 
                    status: req.body.status || 'active',
                    filenames: JSON.stringify(filenames),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    offer_type: req.body.offer_type || 'bank',
                    title: req.body.title || null,
                    description: req.body.description || null,
                    valid_until: req.body.valid_until || null
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
            message: 'Bank and Other Offer Submitted Successfully', 
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
 * @route GET /bankandotheroffers
 * @description Get all bank and other offers with optional filtering
 * @access Public
 */
router.get('/bankandotheroffers', async (req, res) => {
    try {
        let query = supabase
            .from('bankandotheroffers')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters if provided
        if (req.query.status) {
            query = query.eq('status', req.query.status);
        }
        if (req.query.offer_type) {
            query = query.eq('offer_type', req.query.offer_type);
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
        console.error('Error fetching bank and other offers:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route GET /bankandotheroffers/active
 * @description Get all active bank and other offers
 * @access Public
 */
router.get('/bankandotheroffers/active', async (req, res) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('bankandotheroffers')
            .select('*')
            .eq('status', 'active')
            .or(`valid_until.is.null,valid_until.gte.${currentDate}`)
            .order('created_at', { ascending: false });

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
        console.error('Error fetching active offers:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route GET /bankandotheroffers/:id
 * @description Get a single bank or other offer by ID
 * @access Public
 */
router.get('/bankandotheroffers/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bankandotheroffers')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ 
                message: 'Offer not found', 
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
        console.error('Error fetching offer:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route PUT /bankandotheroffers/:id
 * @description Update a bank or other offer
 * @access Public
 */
router.put('/bankandotheroffers/:id', upload.any('offers'), async (req, res) => {
    try {
        const updateData = {
            status: req.body.status,
            offer_type: req.body.offer_type,
            title: req.body.title,
            description: req.body.description,
            valid_until: req.body.valid_until,
            updated_at: new Date().toISOString()
        };

        // If new files are uploaded, update the filenames
        if (req.files && req.files.length > 0) {
            const filenames = req.files.map(file => file.filename);
            updateData.filenames = JSON.stringify(filenames);
        }

        const { data, error } = await supabase
            .from('bankandotheroffers')
            .update(updateData)
            .eq('id', req.params.id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                message: 'Offer not found', 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Offer updated successfully', 
            data: data[0],
            status: true 
        });
    } catch (e) {
        console.error('Error updating offer:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route DELETE /bankandotheroffers/:id
 * @description Delete a bank or other offer by ID
 * @access Public
 */
router.delete('/bankandotheroffers/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bankandotheroffers')
            .delete()
            .eq('id', req.params.id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                message: 'Offer not found', 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Offer deleted successfully', 
            data: data[0],
            status: true 
        });
    } catch (e) {
        console.error('Error deleting offer:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

module.exports = router;