import { useState, useEffect } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../config/supabase';

export default function MyMenuBar() {
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [menuTimeout, setMenuTimeout] = useState(null);
  const [loading, setLoading] = useState(true);

  const open = Boolean(anchorEl);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchAllCategory = async () => {
      try {
        console.log('Fetching categories...');
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/display_all_category`);
        const result = await response.json();
        
        console.log('Categories API Response:', result);
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch categories');
        }
        
        const categories = Array.isArray(result.data) ? result.data : [];
        console.log('Categories loaded:', categories);
        
        if (categories.length === 0) {
          console.warn('No categories found in the database');
        }
        
        setCategory(categories);
      } catch (error) {
        console.error('Error in fetchAllCategory:', {
          message: error.message,
          stack: error.stack
        });
        setCategory([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllCategory();
  }, []);

  const fetchSubCategory = async (categoryId) => {
    if (!categoryId) {
      console.warn('No category ID provided for subcategories');
      setSubCategory([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/get_all_subcategory_by_categoryid?categoryid=${categoryId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch subcategories');
      }
      
      setSubCategory(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubCategory([]);
    }
  };

  const fetchProducts = async (subcategoryId) => {
    if (!subcategoryId) {
      console.warn('No subcategory ID provided for products');
      navigate('/pagecategorydisplay', { state: { productData: [] } });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/get_products_by_subcategory/${subcategoryId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch products');
      }
      
      navigate('/pagecategorydisplay', { 
        state: { 
          productData: Array.isArray(result.data) ? result.data : [],
          subcategoryId: subcategoryId
        } 
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      navigate('/pagecategorydisplay', { state: { productData: [], error: error.message } });
    }
  };

  const handleCategoryHover = async (event, categoryid) => {
    if (menuTimeout) clearTimeout(menuTimeout);
    setAnchorEl(event.currentTarget);
    setHoveredCategoryId(categoryid);
    await fetchSubCategory(categoryid);
  };

  const handleMenuClose = () => {
    setMenuTimeout(setTimeout(() => {
      setAnchorEl(null);
      setHoveredCategoryId(null);
    }, 300));
  };

  const handleMenuEnter = () => {
    if (menuTimeout) clearTimeout(menuTimeout);
  };

  if (loading) {
    return <Box sx={{ p: 2 }}>Loading categories...</Box>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {Array.isArray(category) && category.length > 0 ? (
        category.slice(0, 4).map((item) => (
          <Button
            key={item.id}
            onMouseEnter={(e) => handleCategoryHover(e, item.id)}
            sx={{ color: '#fff', fontWeight: 'bold', mx: 1 }}
          >
            {item.categoryname}
          </Button>
        ))
      ) : (
        <Box sx={{ p: 2 }}>No categories found</Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          onMouseEnter: handleMenuEnter,
          onMouseLeave: handleMenuClose,
          sx: { minWidth: 200 }
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {Array.isArray(subCategory) && subCategory.length > 0 ? (
          subCategory.map((item) => (
            <MenuItem
              key={item.id}
              onClick={() => {
                setAnchorEl(null);
                fetchProducts(item.id);
              }}
              sx={{ minWidth: 200 }}
            >
              {item.subcategoryname || item.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No subcategories found</MenuItem>
        )}
      </Menu>
    </Box>
  );
}
