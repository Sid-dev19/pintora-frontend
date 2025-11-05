const express = require('express');
const router = express.Router();
const upload = require('./multer');
const supabase = require('../config/supabase');
const withRetry = require('./utils/withRetry');

// Helper function to process product data
function processProduct(product) {
    if (!product) return null;
    return {
        id: product.id || product.productid,
        productid: product.productid,
        categoryid: product.categoryid,
        subcategoryid: product.subcategoryid,
        brandid: product.brandid,
        productname: product.productname,
        productdescription: product.productdescription,
        picture: product.picture,
        status: product.status || 'active',
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString(),
        user_admin: product.user_admin || null,
        categoryname: product.categoryname || '',
        subcategoryname: product.subcategoryname || '',
        brandname: product.brandname || ''
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
        response.message = 'A product with this name already exists';
    } else if (error.code === '23503') { // Foreign key violation
        response.message = 'Invalid reference (category, subcategory, or brand)';
    } else if (error.code === '42P01') { // Table doesn't exist
        response.message = 'Database configuration error';
        response.details = 'Required database tables are missing';
    }

    return res.status(statusCode).json(response);
}

// Helper function to enrich products with related data
async function enrichProductsWithRelatedData(products) {
    if (!products || products.length === 0) return [];

    // Get all related IDs
    const categoryIds = [...new Set(products.map(p => p.categoryid).filter(Boolean))];
    const subcategoryIds = [...new Set(products.map(p => p.subcategoryid).filter(Boolean))];
    const brandIds = [...new Set(products.map(p => p.brandid).filter(Boolean))];

    // Fetch related data in parallel
    const [categories, subcategories, brands] = await Promise.all([
        categoryIds.length > 0 ? 
            withRetry(() => supabase.from('category').select('categoryid, categoryname').in('categoryid', categoryIds)) : 
            { data: [] },
        subcategoryIds.length > 0 ? 
            withRetry(() => supabase.from('subcategory').select('subcategoryid, subcategoryname').in('subcategoryid', subcategoryIds)) : 
            { data: [] },
        brandIds.length > 0 ? 
            withRetry(() => supabase.from('brands').select('brandid, brandname').in('brandid', brandIds)) : 
            { data: [] }
    ]);

    // Create lookup maps
    const categoryMap = new Map(categories.data?.map(cat => [cat.categoryid, cat.categoryname]) || []);
    const subcategoryMap = new Map(subcategories.data?.map(sub => [sub.subcategoryid, sub.subcategoryname]) || []);
    const brandMap = new Map(brands.data?.map(brand => [brand.brandid, brand.brandname]) || []);

    // Enrich products with related data
    return products.map(product => ({
        ...processProduct(product),
        categoryname: categoryMap.get(product.categoryid) || '',
        subcategoryname: subcategoryMap.get(product.subcategoryid) || '',
        brandname: brandMap.get(product.brandid) || ''
    }));
}

// Create Product
router.post('/product_submit', upload.single('picture'), async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = [
            'categoryid', 'subcategoryid', 'brandid', 'productname'
        ];
        
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                fields: missingFields,
                timestamp: new Date().toISOString()
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Product image is required',
                field: 'picture',
                timestamp: new Date().toISOString()
            });
        }

        const productData = {
            categoryid: req.body.categoryid,
            subcategoryid: req.body.subcategoryid,
            brandid: req.body.brandid,
            productname: req.body.productname.trim(),
            productdescription: req.body.productdescription ? req.body.productdescription.trim() : null,
            picture: req.file.filename,
            status: req.body.status || 'active',
            created_at: req.body.created_at || new Date().toISOString(),
            updated_at: req.body.updated_at || new Date().toISOString(),
            user_admin: req.body.user_admin || null
        };

        // Execute with retry logic
        const { data, error } = await withRetry(async () => {
            const result = await supabase
                .from('products')
                .insert([productData])
                .select();
            
            if (result.error) {
                const error = new Error(result.error.message);
                error.code = result.error.code;
                throw error;
            }
            
            return result;
        });

        if (error) throw error;

        // Get the created product with related data
        const createdProduct = processProduct(data[0]);
        const enrichedProduct = (await enrichProductsWithRelatedData([createdProduct]))[0];

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: enrichedProduct,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to create product');
    }
});

// Update Product (without picture)
router.post('/edit_product_data', async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.productid) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required',
                field: 'productid',
                timestamp: new Date().toISOString()
            });
        }

        const requiredFields = ['productname', 'brandid', 'categoryid', 'subcategoryid'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                fields: missingFields,
                timestamp: new Date().toISOString()
            });
        }

        const updateData = {
            productname: req.body.productname.trim(),
            brandid: req.body.brandid,
            categoryid: req.body.categoryid,
            subcategoryid: req.body.subcategoryid,
            productdescription: req.body.productdescription ? req.body.productdescription.trim() : null,
            status: req.body.status || 'active',
            updated_at: new Date().toISOString(),
            user_admin: req.body.user_admin || null
        };

        // Execute with retry logic
        const { data, error } = await withRetry(async () => {
            const result = await supabase
                .from('products')
                .update(updateData)
                .eq('productid', req.body.productid)
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
                message: 'Product not found',
                productid: req.body.productid,
                timestamp: new Date().toISOString()
            });
        }

        // Get the updated product with related data
        const updatedProduct = processProduct(data[0]);
        const enrichedProduct = (await enrichProductsWithRelatedData([updatedProduct]))[0];

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: enrichedProduct,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to update product');
    }
});

// Update Product Picture
router.post('/edit_product_picture', upload.single('picture'), async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.productid) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required',
                field: 'productid',
                timestamp: new Date().toISOString()
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
                field: 'picture',
                timestamp: new Date().toISOString()
            });
        }

        // Execute with retry logic
        const { data, error } = await withRetry(async () => {
            const result = await supabase
                .from('products')
                .update({
                    picture: req.file.filename,
                    updated_at: new Date().toISOString(),
                    user_admin: req.body.user_admin || null
                })
                .eq('productid', req.body.productid)
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
                message: 'Product not found',
                productid: req.body.productid,
                timestamp: new Date().toISOString()
            });
        }

        // Get the updated product with related data
        const updatedProduct = processProduct(data[0]);
        const enrichedProduct = (await enrichProductsWithRelatedData([updatedProduct]))[0];

        res.status(200).json({
            success: true,
            message: 'Product picture updated successfully',
            data: enrichedProduct,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to update product picture');
    }
});

// Delete Product
router.post('/delete_product', async (req, res) => {
    try {
        // Validate required fields
        if (!req.body.productid) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required',
                field: 'productid',
                timestamp: new Date().toISOString()
            });
        }

        // First get the product to return it in the response
        const { data: productData, error: fetchError } = await withRetry(() =>
            supabase
                .from('products')
                .select('*')
                .eq('productid', req.body.productid)
                .single()
        );

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
            throw fetchError;
        }

        if (!productData) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                productid: req.body.productid,
                timestamp: new Date().toISOString()
            });
        }

        // Execute delete with retry logic
        const { error } = await withRetry(() =>
            supabase
                .from('products')
                .delete()
                .eq('productid', req.body.productid)
        );

        if (error) throw error;

        const deletedProduct = processProduct(productData);
        const enrichedProduct = (await enrichProductsWithRelatedData([deletedProduct]))[0];

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: enrichedProduct,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to delete product');
    }
});

// Get All Products with Related Data
router.get('/display_all_product', async (req, res) => {
    try {
        // Execute with retry logic
        const { data: products, error } = await withRetry(async () => {
            const result = await supabase
                .from('products')
                .select('*')
                .order('productname', { ascending: true });
            
            if (result.error) {
                const error = new Error(result.error.message);
                error.code = result.error.code;
                throw error;
            }
            
            return result;
        });

        if (error) throw error;

        if (!products || products.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No products found',
                data: [],
                count: 0,
                timestamp: new Date().toISOString()
            });
        }

        // Enrich products with related data
        const enrichedProducts = await enrichProductsWithRelatedData(products);

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: enrichedProducts,
            count: enrichedProducts.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to retrieve products');
    }
});

// Get Product by ID
router.get('/get_product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required',
                field: 'id',
                timestamp: new Date().toISOString()
            });
        }

        // Execute with retry logic
        const { data: product, error } = await withRetry(async () => {
            const result = await supabase
                .from('products')
                .select('*')
                .eq('productid', productId)
                .single();
            
            if (result.error && result.error.code !== 'PGRST116') { // PGRST116 = not found
                const error = new Error(result.error.message);
                error.code = result.error.code;
                throw error;
            }
            
            return result;
        });

        if (error) throw error;

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
                productid: productId,
                timestamp: new Date().toISOString()
            });
        }

        // Enrich product with related data
        const enrichedProduct = (await enrichProductsWithRelatedData([product]))[0];

        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            data: enrichedProduct,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to retrieve product');
    }
});

// Get Products by Brand ID
router.get('/get_products_by_brand/:brandId', async (req, res) => {
    try {
        const brandId = req.params.brandId;
        
        if (!brandId) {
            return res.status(400).json({
                success: false,
                message: 'Brand ID is required',
                field: 'brandId',
                timestamp: new Date().toISOString()
            });
        }

        // Execute with retry logic
        const { data: products, error } = await withRetry(async () => {
            const result = await supabase
                .from('products')
                .select('*')
                .eq('brandid', brandId)
                .order('productname', { ascending: true });
            
            if (result.error) {
                const error = new Error(result.error.message);
                error.code = result.error.code;
                throw error;
            }
            
            return result;
        });

        if (error) throw error;

        if (!products || products.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No products found for this brand',
                data: [],
                count: 0,
                brandid: brandId,
                timestamp: new Date().toISOString()
            });
        }

        // Enrich products with related data
        const enrichedProducts = await enrichProductsWithRelatedData(products);

        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: enrichedProducts,
            count: enrichedProducts.length,
            brandid: brandId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        sendErrorResponse(res, error, 'Failed to retrieve products by brand');
    }
});

module.exports = router;
