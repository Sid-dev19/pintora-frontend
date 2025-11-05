const express = require('express');
const router = express.Router();
const upload = require('./multer');
const supabase = require('../config/supabase');

// Create Brand
router.post('/brand_submit', upload.single('brandicon'), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('brands')
            .insert([{
                categoryid: req.body.categoryid,
                subcategoryid: req.body.subcategoryid,
                brandname: req.body.brandname,
                brandicon: req.file ? req.file.filename : null,
                created_at: req.body.created_at || new Date().toISOString(),
                updated_at: req.body.updated_at || new Date().toISOString(),
                user_admin: req.body.user_admin
            }]);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                message: 'Database Error: ' + error.message, 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Brand Submitted Successfully', 
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

// Update Brand (without icon)
router.post('/edit_brand_data', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('brands')
            .update({
                brandname: req.body.brandname,
                categoryid: req.body.categoryid,
                subcategoryid: req.body.subcategoryid,
                updated_at: new Date().toISOString(),
                user_admin: req.body.user_admin
            })
            .eq('brandid', req.body.brandid)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                message: 'Brand not found', 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Brand Updated Successfully', 
            data: data[0], 
            status: true 
        });
    } catch (e) {
        console.error('Error updating brand:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Update Brand Icon
router.post('/edit_brand_icon', upload.single('brandicon'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                message: 'No file uploaded', 
                status: false 
            });
        }

        const { data, error } = await supabase
            .from('brands')
            .update({
                brandicon: req.file.filename,
                updated_at: new Date().toISOString(),
                user_admin: req.body.user_admin
            })
            .eq('brandid', req.body.brandid)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                message: 'Brand not found', 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Brand Icon Updated Successfully', 
            data: data[0], 
            status: true 
        });
    } catch (e) {
        console.error('Error updating brand icon:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Delete Brand
router.post('/delete_brand', async (req, res) => {
    try {
        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('brandid', req.body.brandid);

        if (error) throw error;

        res.status(200).json({ 
            message: 'Brand Deleted Successfully', 
            status: true 
        });
    } catch (e) {
        console.error('Error deleting brand:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Get All Brands with Category and Subcategory Names
router.get('/display_all_brand', async (req, res) => {
    try {
        // First get all brands
        const { data: brands, error: brandError } = await supabase
            .from('brands')
            .select('*')
            .order('created_at', { ascending: false });

        if (brandError) throw brandError;

        // Get all categories and subcategories for lookup
        const [categories, subcategories] = await Promise.all([
            supabase.from('category').select('categoryid, categoryname'),
            supabase.from('subcategory').select('subcategoryid, subcategoryname')
        ]);

        if (categories.error) throw categories.error;
        if (subcategories.error) throw subcategories.error;

        // Create lookup maps
        const categoryMap = new Map(categories.data.map(cat => [cat.categoryid, cat.categoryname]));
        const subcategoryMap = new Map(subcategories.data.map(sub => [sub.subcategoryid, sub.subcategoryname]));

        // Add category and subcategory names to brands
        const brandsWithNames = brands.map(brand => ({
            ...brand,
            categoryname: categoryMap.get(brand.categoryid) || '',
            subcategoryname: subcategoryMap.get(brand.subcategoryid) || ''
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: brandsWithNames, 
            status: true 
        });
    } catch (e) {
        console.error('Error fetching brands:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Get Brands by Subcategory ID
router.post('/get_all_brand_by_subcategoryid', async (req, res) => {
    try {
        const { data: brands, error: brandError } = await supabase
            .from('brands')
            .select('*')
            .eq('subcategoryid', req.body.subcategoryid);

        if (brandError) throw brandError;

        if (!brands || brands.length === 0) {
            return res.status(200).json({ 
                message: 'No brands found for this subcategory', 
                data: [], 
                status: true 
            });
        }

        // Get categories and subcategories for the found brands
        const categoryIds = [...new Set(brands.map(b => b.categoryid))];
        const subcategoryIds = [req.body.subcategoryid];

        const [categories, subcategories] = await Promise.all([
            supabase.from('category').select('categoryid, categoryname').in('categoryid', categoryIds),
            supabase.from('subcategory').select('subcategoryid, subcategoryname').in('subcategoryid', subcategoryIds)
        ]);

        if (categories.error) throw categories.error;
        if (subcategories.error) throw subcategories.error;

        // Create lookup maps
        const categoryMap = new Map(categories.data.map(cat => [cat.categoryid, cat.categoryname]));
        const subcategoryMap = new Map(subcategories.data.map(sub => [sub.subcategoryid, sub.subcategoryname]));

        // Add names to brands
        const brandsWithNames = brands.map(brand => ({
            ...brand,
            categoryname: categoryMap.get(brand.categoryid) || '',
            subcategoryname: subcategoryMap.get(brand.subcategoryid) || ''
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: brandsWithNames, 
            status: true 
        });
    } catch (e) {
        console.error('Error fetching brands by subcategory:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

module.exports = router;
