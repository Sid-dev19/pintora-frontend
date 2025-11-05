const express = require('express');
const router = express.Router();
const upload = require('./multer');
const supabase = require('../config/supabase');

/**
 * @route POST /mainbanner_submit
 * @description Submit main banner with multiple images
 * @access Public
 */
router.post('/mainbanner_submit', upload.any('banners'), async (req, res) => {
    try {
        // Validate request
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                message: 'Please upload at least one banner image', 
                status: false 
            });
        }

        // Extract filenames from uploaded files
        const filenames = req.files.map(file => file.filename);
        
        // Insert into Supabase
        const { data, error } = await supabase
            .from('mainbanner')
            .insert([
                { 
                    status: req.body.status || 'active',
                    filenames: JSON.stringify(filenames),
                    created_at: new Date().toISOString()
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
            message: 'Main Banner Submitted Successfully', 
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
 * @route GET /mainbanner
 * @description Get all active main banners
 * @access Public
 */
router.get('/mainbanner', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('mainbanner')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Parse the filenames from JSON string to array
        const banners = data.map(banner => ({
            ...banner,
            filenames: banner.filenames ? JSON.parse(banner.filenames) : []
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: banners, 
            status: true 
        });
    } catch (e) {
        console.error('Error fetching banners:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route DELETE /mainbanner/:id
 * @description Delete a main banner by ID
 * @access Public
 */
router.delete('/mainbanner/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('mainbanner')
            .delete()
            .eq('id', req.params.id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                message: 'Banner not found', 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Banner deleted successfully', 
            data: data[0],
            status: true 
        });
    } catch (e) {
        console.error('Error deleting banner:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

module.exports = router;