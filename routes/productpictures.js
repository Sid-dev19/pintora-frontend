const express = require('express');
const router = express.Router();
const upload = require('./multer');
const supabase = require('../config/supabase');

// Submit Multiple Product Pictures
router.post('/productpicture_submit', upload.any(), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                message: 'No files uploaded', 
                status: false 
            });
        }

        // Extract filenames from uploaded files
        const filenames = req.files.map(file => file.filename);

        const { data, error } = await supabase
            .from('productpictures')
            .insert([{
                categoryid: req.body.categoryid,
                subcategoryid: req.body.subcategoryid,
                brandid: req.body.brandid,
                productid: req.body.productid,
                productdetailid: req.body.productdetailid,
                filenames: JSON.stringify(filenames),
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
            message: 'Product Pictures Submitted Successfully', 
            data: {
                ...data[0],
                filenames: JSON.parse(data[0].filenames)
            }, 
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

// Get Product Pictures by Product Detail ID
router.get('/get_by_productdetail/:productdetailid', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('productpictures')
            .select('*')
            .eq('productdetailid', req.params.productdetailid);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(200).json({ 
                message: 'No pictures found for this product', 
                data: [], 
                status: true 
            });
        }

        // Parse filenames from JSON string to array
        const formattedData = data.map(item => ({
            ...item,
            filenames: JSON.parse(item.filenames)
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: formattedData, 
            status: true 
        });
    } catch (e) {
        console.error('Error fetching product pictures:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Delete Product Picture
router.delete('/delete/:id', async (req, res) => {
    try {
        // First get the record to delete the files if needed
        const { data: existing, error: fetchError } = await supabase
            .from('productpictures')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError) throw fetchError;
        if (!existing) {
            return res.status(404).json({ 
                message: 'Product picture not found', 
                status: false 
            });
        }

        // Delete the record
        const { error } = await supabase
            .from('productpictures')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.status(200).json({ 
            message: 'Product Picture Deleted Successfully', 
            status: true 
        });
    } catch (e) {
        console.error('Error deleting product picture:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Update Product Pictures (replace all pictures for a product detail)
router.put('/update/:productdetailid', upload.any(), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                message: 'No files uploaded', 
                status: false 
            });
        }

        // Extract filenames from uploaded files
        const filenames = req.files.map(file => file.filename);

        // Check if record exists
        const { data: existing, error: fetchError } = await supabase
            .from('productpictures')
            .select('*')
            .eq('productdetailid', req.params.productdetailid)
            .single();

        let result;
        if (fetchError || !existing) {
            // Create new record if not exists
            const { data, error } = await supabase
                .from('productpictures')
                .insert([{
                    categoryid: req.body.categoryid,
                    subcategoryid: req.body.subcategoryid,
                    brandid: req.body.brandid,
                    productid: req.body.productid,
                    productdetailid: req.params.productdetailid,
                    filenames: JSON.stringify(filenames),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    user_admin: req.body.user_admin
                }])
                .select();

            if (error) throw error;
            result = data[0];
        } else {
            // Update existing record
            const { data, error } = await supabase
                .from('productpictures')
                .update({
                    filenames: JSON.stringify(filenames),
                    updated_at: new Date().toISOString(),
                    user_admin: req.body.user_admin
                })
                .eq('productdetailid', req.params.productdetailid)
                .select();

            if (error) throw error;
            result = data[0];
        }

        res.status(200).json({ 
            message: 'Product Pictures Updated Successfully', 
            data: {
                ...result,
                filenames: JSON.parse(result.filenames)
            },
            status: true 
        });
    } catch (e) {
        console.error('Error updating product pictures:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

module.exports = router;