import Header from '../homepage/Header';
import Footer from '../homepage/Footer'
import * as React from 'react';
import { useState, useEffect } from 'react';
import { serverURL, getData, postData } from "../../../services/FetchNodeAdminServices";
import { Divider, Grid, CircularProgress, Box, Button, Typography, IconButton, Paper } from '@mui/material';
import ProductImageComponent from '../productdetailspage/ProductImageComponent';
import ProductDescription from './ProductDescription';
import ProductsScroll from '../homepage/ProductsScroll';
import { useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useDispatch, useSelector } from 'react-redux';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Add Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 20, textAlign: 'center' }}>Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

export default function ProductDetailPage() {
  const location = useLocation();
  const dispatch = useDispatch();
  const p = location?.state?.product;
  const [popularProducts, setPopularProducts] = useState([]);
  const [product, setProduct] = useState(p);
  const [quantity, setQuantity] = useState(1);
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cart = useSelector(state => state.cart || {});

  const handleAddToCart = () => {
    if (product) {
      const item = {
        ...product,
        qty: quantity
      };
      dispatch({ type: 'ADD_CART', payload: [product.productdetailid, item] });
      setRefresh(!refresh);
    }
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const fetchAllProductDetails = async (productstatus) => {
    try {
      setLoading(true);
      const result = await postData('userinterface/display_all_productdetail_by_status', { productstatus });
      if (result && result.data) {
        setPopularProducts(result.data);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProductDetails('Popular');
  }, []);

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <div style={{ textAlign: 'center' }}>
          <h3>{error}</h3>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <Header />
        
        <Grid container spacing={2} style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Grid item xs={12} md={6}>
            <ProductImageComponent 
              refresh={refresh} 
              setRefresh={setRefresh} 
              product={product} 
              setProduct={setProduct} 
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <ProductDescription product={product} setProduct={setProduct} />
            
            <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" gutterBottom>Quantity</Typography>
              <Box display="flex" alignItems="center" mb={3}>
                <IconButton 
                  onClick={handleDecrement} 
                  size="small" 
                  sx={{ border: '1px solid #e0e0e0', mr: 1 }}
                  disabled={quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography variant="body1" sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton 
                  onClick={handleIncrement} 
                  size="small" 
                  sx={{ border: '1px solid #e0e0e0', ml: 1 }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                Add to Cart
              </Button>
              
              {cart[product?.productdetailid] && (
                <Typography 
                  variant="body2" 
                  color="success.main" 
                  sx={{ mt: 1, textAlign: 'center' }}
                >
                  {cart[product.productdetailid].qty} item(s) in cart
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, width: '90%', mx: 'auto' }} />

        <Box sx={{ width: '90%', maxWidth: '1200px', mx: 'auto', my: 4 }}>
          <ProductsScroll 
            title="Popular Products" 
            data={popularProducts} 
            key="popular-products" 
          />
        </Box>

        <Divider sx={{ my: 4, width: '90%', mx: 'auto' }} />

        <Box sx={{ width: '90%', maxWidth: '1200px', mx: 'auto', my: 4, mb: 8 }}>
          <ProductsScroll 
            title="Similar Products" 
            data={popularProducts} 
            key="similar-products" 
          />
        </Box>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}