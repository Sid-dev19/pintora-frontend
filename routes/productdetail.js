const express = require('express');
const router = express.Router();
const upload = require('./multer');
const supabase = require('../config/supabase');

// Create Product Detail
router.post('/productdetail_submit', upload.single('picture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                message: 'Product detail image is required', 
                status: false 
            });
        }

        const { data, error } = await supabase
            .from('productdetails')
            .insert([{
                categoryid: req.body.categoryid,
                subcategoryid: req.body.subcategoryid,
                brandid: req.body.brandid,
                productid: req.body.productid,
                productdetailname: req.body.productdetailname,
                weight: req.body.weight,
                weightType: req.body.weightType,
                packagingtype: req.body.packagingtype,
                noofqty: req.body.noofqty,
                stock: req.body.stock,
                price: req.body.price,
                offerprice: req.body.offerprice,
                offertype: req.body.offertype,
                productstatus: req.body.productstatus,
                productdetaildescription: req.body.productdetaildescription,
                picture: req.file.filename,
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
            message: 'Product Detail Submitted Successfully', 
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

// Update Product Detail (without picture)
router.post('/edit_productdetail_data', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('productdetails')
            .update({
                categoryid: req.body.categoryid,
                subcategoryid: req.body.subcategoryid,
                brandid: req.body.brandid,
                productid: req.body.productid,
                productdetailname: req.body.productdetailname,
                weight: req.body.weight,
                weightType: req.body.weightType,
                packagingtype: req.body.packagingtype,
                noofqty: req.body.noofqty,
                stock: req.body.stock,
                price: req.body.price,
                offerprice: req.body.offerprice,
                offertype: req.body.offertype,
                productstatus: req.body.productstatus,
                productdetaildescription: req.body.productdetaildescription,
                updated_at: new Date().toISOString(),
                user_admin: req.body.user_admin
            })
            .eq('productdetailid', req.body.productdetailid)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                message: 'Product detail not found', 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Product Detail Updated Successfully', 
            data: data[0], 
            status: true 
        });
    } catch (e) {
        console.error('Error updating product detail:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Update Product Detail Picture
router.post('/edit_productdetail_picture', upload.single('picture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                message: 'No file uploaded', 
                status: false 
            });
        }

        const { data, error } = await supabase
            .from('productdetails')
            .update({
                picture: req.file.filename,
                updated_at: new Date().toISOString(),
                user_admin: req.body.user_admin
            })
            .eq('productdetailid', req.body.productdetailid)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ 
                message: 'Product detail not found', 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Product Detail Picture Updated Successfully', 
            data: data[0], 
            status: true 
        });
    } catch (e) {
        console.error('Error updating product detail picture:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Delete Product Detail
router.post('/delete_productdetail', async (req, res) => {
    try {
        const { error } = await supabase
            .from('productdetails')
            .delete()
            .eq('productdetailid', req.body.productdetailid);

        if (error) throw error;

        res.status(200).json({ 
            message: 'Product Detail Deleted Successfully', 
            status: true 
        });
    } catch (e) {
        console.error('Error deleting product detail:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Get All Product Details with Related Data
router.get('/display_all_productdetail', async (req, res) => {
    try {
        // First get all product details
        const { data: productDetails, error: pdError } = await supabase
            .from('productdetails')
            .select('*')
            .order('created_at', { ascending: false });

        if (pdError) throw pdError;

        if (!productDetails || productDetails.length === 0) {
            return res.status(200).json({ 
                message: 'No product details found', 
                data: [], 
                status: true 
            });
        }

        // Get all related data for lookup
        const categoryIds = [...new Set(productDetails.map(pd => pd.categoryid))];
        const subcategoryIds = [...new Set(productDetails.map(pd => pd.subcategoryid))];
        const brandIds = [...new Set(productDetails.map(pd => pd.brandid))];
        const productIds = [...new Set(productDetails.map(pd => pd.productid))];

        const [categories, subcategories, brands, products] = await Promise.all([
            supabase.from('category').select('categoryid, categoryname').in('categoryid', categoryIds),
            supabase.from('subcategory').select('subcategoryid, subcategoryname').in('subcategoryid', subcategoryIds),
            supabase.from('brands').select('brandid, brandname').in('brandid', brandIds),
            supabase.from('products').select('productid, productname').in('productid', productIds)
        ]);

        if (categories.error) throw categories.error;
        if (subcategories.error) throw subcategories.error;
        if (brands.error) throw brands.error;
        if (products.error) throw products.error;

        // Create lookup maps
        const categoryMap = new Map(categories.data.map(cat => [cat.categoryid, cat.categoryname]));
        const subcategoryMap = new Map(subcategories.data.map(sub => [sub.subcategoryid, sub.subcategoryname]));
        const brandMap = new Map(brands.data.map(brand => [brand.brandid, brand.brandname]));
        const productMap = new Map(products.data.map(prod => [prod.productid, prod.productname]));

        // Add related data to product details
        const productDetailsWithNames = productDetails.map(pd => ({
            ...pd,
            categoryname: categoryMap.get(pd.categoryid) || '',
            subcategoryname: subcategoryMap.get(pd.subcategoryid) || '',
            brandname: brandMap.get(pd.brandid) || '',
            productname: productMap.get(pd.productid) || ''
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: productDetailsWithNames, 
            status: true 
        });
    } catch (e) {
        console.error('Error fetching product details:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

// Get Product Details by Product ID
router.post('/get_all_productdetail_by_productid', async (req, res) => {
    try {
        const { data: productDetails, error: pdError } = await supabase
            .from('productdetails')
            .select('*')
            .eq('productid', req.body.productid);

        if (pdError) throw pdError;

        if (!productDetails || productDetails.length === 0) {
            return res.status(200).json({ 
                message: 'No product details found for this product', 
                data: [], 
                status: true 
            });
        }

        // Get related data for the found product details
        const categoryIds = [...new Set(productDetails.map(pd => pd.categoryid))];
        const subcategoryIds = [...new Set(productDetails.map(pd => pd.subcategoryid))];
        const brandIds = [...new Set(productDetails.map(pd => pd.brandid))];
        const productIds = [req.body.productid];

        const [categories, subcategories, brands, products] = await Promise.all([
            supabase.from('category').select('categoryid, categoryname').in('categoryid', categoryIds),
            supabase.from('subcategory').select('subcategoryid, subcategoryname').in('subcategoryid', subcategoryIds),
            supabase.from('brands').select('brandid, brandname').in('brandid', brandIds),
            supabase.from('products').select('productid, productname').in('productid', productIds)
        ]);

        if (categories.error) throw categories.error;
        if (subcategories.error) throw subcategories.error;
        if (brands.error) throw brands.error;
        if (products.error) throw products.error;

        // Create lookup maps
        const categoryMap = new Map(categories.data.map(cat => [cat.categoryid, cat.categoryname]));
        const subcategoryMap = new Map(subcategories.data.map(sub => [sub.subcategoryid, sub.subcategoryname]));
        const brandMap = new Map(brands.data.map(brand => [brand.brandid, brand.brandname]));
        const productMap = new Map(products.data.map(prod => [prod.productid, prod.productname]));

        // Add related data to product details
        const productDetailsWithNames = productDetails.map(pd => ({
            ...pd,
            categoryname: categoryMap.get(pd.categoryid) || '',
            subcategoryname: subcategoryMap.get(pd.subcategoryid) || '',
            brandname: brandMap.get(pd.brandid) || '',
            productname: productMap.get(pd.productid) || ''
        }));

        res.status(200).json({ 
            message: 'Success', 
            data: productDetailsWithNames, 
            status: true 
        });
    } catch (e) {
        console.error('Error fetching product details by product ID:', e);
        res.status(500).json({ 
            message: 'Server Error: ' + e.message, 
            status: false 
        });
    }
});

module.exports = router;
