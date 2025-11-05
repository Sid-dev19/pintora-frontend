import { userStyle } from "./ProductDetailsCss";
import { useState, useEffect } from "react";
import { postData, getData, currentDate } from "../../../services/FetchNodeAdminServices";
import Swal from "sweetalert2";
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from "@mui/lab";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { 
  Grid, 
  FormHelperText, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Avatar, 
  Button, 
  TextField,
  Typography
} from "@mui/material";
import logo from '../../../assets/logo.png';
import cart from '../../../assets/cart.png';

// Constants
const WEIGHT_TYPES = ['Mili Grams', 'Grams', 'KGS', 'Mili Liters', 'Liters'];
const PACKAGING_TYPES = ['Bottle', 'Box', 'Single', 'Plastic Bags'];
const OFFER_TYPES = ['15th August Sale', 'Rakhi Sale', 'Diwali Sale', '10% Sale'];
const PRODUCT_STATUSES = ['Trending', 'Popular'];

export default function ProductDetails() {
  const classes = userStyle();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryId: '',
    brandId: '',
    productId: '',
    productDetailName: '',
    weight: '',
    weightType: '',
    packagingType: '',
    noOfQty: '',
    stock: '',
    price: '',
    offerPrice: '',
    offerType: '',
    productStatus: '',
    productDetailDescription: '',
    productDetailPicture: { bytes: '', fileName: cart }
  });
  const [errorMessages, setErrorMessages] = useState({});
  const [lists, setLists] = useState({
    categoryList: [],
    subCategoryList: [],
    brandList: [],
    productList: []
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getData('category/display_all_category');
        if (result?.data) {
          setLists(prev => ({ ...prev, categoryList: result.data }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        showError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const clearError = (field) => {
    if (errorMessages[field]) {
      setErrorMessages(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle category selection
  const handleCategoryChange = async (categoryId) => {
    setFormData(prev => ({ 
      ...prev, 
      categoryId,
      subCategoryId: '',
      brandId: '',
      productId: ''
    }));
    setLists(prev => ({ 
      ...prev, 
      subCategoryList: [],
      brandList: [],
      productList: [] 
    }));
    
    try {
      const result = await postData('subcategory/get_all_subcategory_by_categoryid', { categoryid: categoryId });
      if (result?.data) {
        setLists(prev => ({ ...prev, subCategoryList: result.data }));
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      showError("Failed to load subcategories");
    }
  };

  // Handle subcategory selection
  const handleSubCategoryChange = async (subCategoryId) => {
    setFormData(prev => ({ 
      ...prev, 
      subCategoryId,
      brandId: '',
      productId: ''
    }));
    setLists(prev => ({ 
      ...prev, 
      brandList: [],
      productList: [] 
    }));
    
    try {
      const result = await postData('brand/get_all_brand_by_subcategoryid', { subcategoryid: subCategoryId });
      if (result?.data) {
        setLists(prev => ({ ...prev, brandList: result.data }));
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      showError("Failed to load brands");
    }
  };

  // Handle brand selection
  const handleBrandChange = async (brandId) => {
    setFormData(prev => ({ ...prev, brandId, productId: '' }));
    setLists(prev => ({ ...prev, productList: [] }));
    
    try {
      const result = await postData('product/get_all_product_by_brandid', { brandid: brandId });
      if (result?.data) {
        setLists(prev => ({ ...prev, productList: result.data }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showError("Failed to load products");
    }
  };

  // Handle image upload
  const handleImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange('productDetailPicture', { 
        bytes: e.target.files[0], 
        fileName: URL.createObjectURL(e.target.files[0]) 
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'categoryId', 'subCategoryId', 'brandId', 'productId',
      'productDetailName', 'weight', 'weightType', 'packagingType',
      'noOfQty', 'stock', 'price', 'offerPrice', 'offerType',
      'productStatus', 'productDetailDescription'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        errors[field] = `Please enter ${fieldName}`;
      }
    });

    if (!formData.productDetailPicture.bytes) {
      errors.productDetailPicture = 'Please select an image';
    }

    setErrorMessages(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('categoryid', formData.categoryId);
      formDataToSend.append('subcategoryid', formData.subCategoryId);
      formDataToSend.append('brandid', formData.brandId);
      formDataToSend.append('productid', formData.productId);
      formDataToSend.append('productdetailname', formData.productDetailName);
      formDataToSend.append('weight', formData.weight);
      formDataToSend.append('weightType', formData.weightType);
      formDataToSend.append('packagingtype', formData.packagingType);
      formDataToSend.append('noofqty', formData.noOfQty);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('offerprice', formData.offerPrice);
      formDataToSend.append('offertype', formData.offerType);
      formDataToSend.append('productstatus', formData.productStatus);
      formDataToSend.append('productdetaildescription', formData.productDetailDescription);
      formDataToSend.append('picture', formData.productDetailPicture.bytes);
      formDataToSend.append('created_at', currentDate());
      formDataToSend.append('updated_at', currentDate());
      formDataToSend.append('user_admin', 'Admin');

      const result = await postData('productdetail/productdetail_submit', formDataToSend);
      
      if (result.status) {
        showSuccess(result.message);
        resetForm();
      } else {
        showError(result.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      showError('An error occurred while saving the product');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      categoryId: '',
      subCategoryId: '',
      brandId: '',
      productId: '',
      productDetailName: '',
      weight: '',
      weightType: '',
      packagingType: '',
      noOfQty: '',
      stock: '',
      price: '',
      offerPrice: '',
      offerType: '',
      productStatus: '',
      productDetailDescription: '',
      productDetailPicture: { bytes: '', fileName: cart }
    });
    setErrorMessages({});
  };

  // Show success message
  const showSuccess = (message) => {
    Swal.fire({
      position: 'top',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 1500,
      toast: true
    });
  };

  // Show error message
  const showError = (message) => {
    Swal.fire({
      position: 'top',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 2000,
      toast: true
    });
  };

  // Render form
  return (
    <div className={classes.root}>
      <div className={classes.box}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className={classes.mainHeadingStyle}>
              <img src={logo} alt="Logo" className={classes.imageStyle} />
              <Typography variant="h6" className={classes.headingStyle}>
                Product Details
              </Typography>
            </div>
          </Grid>

          {/* Category */}
          <Grid item xs={3}>
            <FormControl fullWidth error={!!errorMessages.categoryId}>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.categoryId}
                label="Category *"
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {lists.categoryList.map((item) => (
                  <MenuItem key={item.categoryid} value={item.categoryid}>
                    {item.categoryname}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorMessages.categoryId}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Sub-Category */}
          <Grid item xs={3}>
            <FormControl fullWidth error={!!errorMessages.subCategoryId}>
              <InputLabel>Sub-Category *</InputLabel>
              <Select
                value={formData.subCategoryId}
                label="Sub-Category *"
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                disabled={!formData.categoryId}
              >
                {lists.subCategoryList.map((item) => (
                  <MenuItem key={item.subcategoryid} value={item.subcategoryid}>
                    {item.subcategoryname}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorMessages.subCategoryId}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Brand */}
          <Grid item xs={3}>
            <FormControl fullWidth error={!!errorMessages.brandId}>
              <InputLabel>Brand *</InputLabel>
              <Select
                value={formData.brandId}
                label="Brand *"
                onChange={(e) => handleBrandChange(e.target.value)}
                disabled={!formData.subCategoryId}
              >
                {lists.brandList.map((item) => (
                  <MenuItem key={item.brandid} value={item.brandid}>
                    {item.brandname}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorMessages.brandId}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Product */}
          <Grid item xs={3}>
            <FormControl fullWidth error={!!errorMessages.productId}>
              <InputLabel>Product *</InputLabel>
              <Select
                value={formData.productId}
                label="Product *"
                onChange={(e) => handleInputChange('productId', e.target.value)}
                disabled={!formData.brandId}
              >
                {lists.productList.map((item) => (
                  <MenuItem key={item.productid} value={item.productid}>
                    {item.productname}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorMessages.productId}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Product Detail Name */}
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Product Detail Name *"
              value={formData.productDetailName}
              onChange={(e) => handleInputChange('productDetailName', e.target.value)}
              error={!!errorMessages.productDetailName}
              helperText={errorMessages.productDetailName}
            />
          </Grid>

          {/* Product Status */}
          <Grid item xs={4}>
            <FormControl fullWidth error={!!errorMessages.productStatus}>
              <InputLabel>Product Status *</InputLabel>
              <Select
                label="Product Status *"
                value={formData.productStatus}
                onChange={(e) => handleInputChange('productStatus', e.target.value)}
              >
                {PRODUCT_STATUSES.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorMessages.productStatus}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Weight */}
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Weight *"
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              error={!!errorMessages.weight}
              helperText={errorMessages.weight}
            />
          </Grid>

          {/* Weight Type */}
          <Grid item xs={3}>
            <FormControl fullWidth error={!!errorMessages.weightType}>
              <InputLabel>Weight Type *</InputLabel>
              <Select
                label="Weight Type *"
                value={formData.weightType}
                onChange={(e) => handleInputChange('weightType', e.target.value)}
              >
                {WEIGHT_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorMessages.weightType}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Packaging Type */}
          <Grid item xs={3}>
            <FormControl fullWidth error={!!errorMessages.packagingType}>
              <InputLabel>Packaging Type *</InputLabel>
              <Select
                label="Packaging Type *"
                value={formData.packagingType}
                onChange={(e) => handleInputChange('packagingType', e.target.value)}
              >
                {PACKAGING_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorMessages.packagingType}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Quantity */}
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="No. of Quantity *"
              type="number"
              value={formData.noOfQty}
              onChange={(e) => handleInputChange('noOfQty', e.target.value)}
              error={!!errorMessages.noOfQty}
              helperText={errorMessages.noOfQty}
            />
          </Grid>

          {/* Stock */}
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Stock *"
              type="number"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              error={!!errorMessages.stock}
              helperText={errorMessages.stock}
            />
          </Grid>

          {/* Price */}
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Price *"
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              error={!!errorMessages.price}
              helperText={errorMessages.price}
              InputProps={{ startAdornment: '₹' }}
            />
          </Grid>

          {/* Offer Price */}
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Offer Price *"
              type="number"
              value={formData.offerPrice}
              onChange={(e) => handleInputChange('offerPrice', e.target.value)}
              error={!!errorMessages.offerPrice}
              helperText={errorMessages.offerPrice}
              InputProps={{ startAdornment: '₹' }}
            />
          </Grid>

          {/* Offer Type */}
          <Grid item xs={3}>
            <FormControl fullWidth error={!!errorMessages.offerType}>
              <InputLabel>Offer Type *</InputLabel>
              <Select
                label="Offer Type *"
                value={formData.offerType}
                onChange={(e) => handleInputChange('offerType', e.target.value)}
              >
                {OFFER_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{errorMessages.offerType}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Product Description */}
          <Grid item xs={12}>
            <div style={{ marginBottom: '8px', color: errorMessages.productDetailDescription ? 'red' : 'inherit' }}>
              Product Description *
            </div>
            <ReactQuill
              theme="snow"
              value={formData.productDetailDescription}
              onChange={(value) => handleInputChange('productDetailDescription', value)}
              modules={{
                toolbar: {
                  container: [
                    [{ header: "1" }, { header: "2" }, { font: [] }],
                    [{ size: [] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                    ["link", "image", "video"],
                    ["code-block"],
                    ["clean"]
                  ],
                  clipboard: { matchVisual: false }
                }
              }}
              formats={[
                "header", "font", "size",
                "bold", "italic", "underline", "strike", "blockquote",
                "list", "bullet", "indent",
                "link", "image", "video", "code-block"
              ]}
              style={{ 
                minHeight: '150px',
                marginBottom: errorMessages.productDetailDescription ? '24px' : '0'
              }}
            />
            {errorMessages.productDetailDescription && (
              <FormHelperText error style={{ marginTop: '4px' }}>
                {errorMessages.productDetailDescription}
              </FormHelperText>
            )}
          </Grid>

          {/* Image Upload */}
          <Grid item xs={6} className={classes.center}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Button 
                variant="contained" 
                component="label"
                style={{ width: 'fit-content' }}
              >
                Upload Image
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleImage}
                />
              </Button>
              {errorMessages.productDetailPicture && (
                <FormHelperText error>
                  {errorMessages.productDetailPicture}
                </FormHelperText>
              )}
            </div>
          </Grid>

          {/* Image Preview */}
          <Grid item xs={6} className={classes.center}>
            <Avatar 
              src={formData.productDetailPicture.fileName} 
              variant="rounded"
              sx={{ 
                width: 150, 
                height: 150,
                border: '1px solid #ddd',
                borderRadius: 2
              }}
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={6} className={classes.center}>
            <LoadingButton
              loading={loading}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              Save
            </LoadingButton>
          </Grid>
          <Grid item xs={6} className={classes.center}>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={resetForm}
              disabled={loading}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}