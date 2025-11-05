import { userStyle } from "./ProductDetailsCss";
import { useState, useEffect } from "react";
import MaterialTable from "@material-table/core";
import { getData, postData, currentDate, serverURL } from "../../../services/FetchNodeAdminServices";
import { LoadingButton } from "@mui/lab";
import CloseIcon from '@mui/icons-material/Close';
import logo from '../../../assets/logo.png';
import cart from '../../../assets/cart.png';
import Swal from "sweetalert2";
import SaveIcon from '@mui/icons-material/Save';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Grid,
  TextField,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

const WEIGHT_TYPES = ['Mili Grams', 'Grams', 'KGS', 'Mili Liters', 'Liters'];
const PACKAGING_TYPES = ['Bottle', 'Box', 'Single'];
const OFFER_TYPES = ['15th August Sale', 'Rakhi Sale', '10% Sale'];
const PRODUCT_STATUSES = ['Trending', 'Popular'];

export default function DisplayAllProductDetail() {
  const navigate = useNavigate();
  const classes = userStyle();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState({
    categoryList: [],
    subCategoryList: [],
    brandList: [],
    productList: [],
    productDetailList: []
  });
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryId: '',
    brandId: '',
    productId: '',
    productDetailId: '',
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
    productDetailPicture: { bytes: '', fileName: cart },
    oldImage: '',
    hideUploadButton: false
  });
  const [errorMessages, setErrorMessages] = useState({});

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchAllCategory(),
        fetchAllProductDetail()
      ]);
    };
    fetchInitialData();
  }, []);

  // Fetch categories
  const fetchAllCategory = async () => {
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

  // Fetch subcategories by category
  const fetchAllSubCategory = async (categoryId) => {
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

  // Fetch brands by subcategory
  const fetchAllBrand = async (subCategoryId) => {
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

  // Fetch products by brand
  const fetchAllProduct = async (brandId) => {
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

  // Fetch all product details
  const fetchAllProductDetail = async () => {
    setLoading(true);
    try {
      const result = await getData('productdetail/display_all_productdetail');
      if (result?.data) {
        setLists(prev => ({ ...prev, productDetailList: result.data }));
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      showError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({ 
      ...prev, 
      categoryId,
      subCategoryId: '',
      brandId: '',
      productId: ''
    }));
    fetchAllSubCategory(categoryId);
    clearError('categoryId');
  };

  // Handle subcategory selection
  const handleSubCategoryChange = (subCategoryId) => {
    setFormData(prev => ({ 
      ...prev, 
      subCategoryId,
      brandId: '',
      productId: ''
    }));
    fetchAllBrand(subCategoryId);
    clearError('subCategoryId');
  };

  // Handle brand selection
  const handleBrandChange = (brandId) => {
    setFormData(prev => ({ 
      ...prev, 
      brandId,
      productId: ''
    }));
    fetchAllProduct(brandId);
    clearError('brandId');
  };

  // Handle image upload
  const handleImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange('productDetailPicture', { 
        bytes: e.target.files[0], 
        fileName: URL.createObjectURL(e.target.files[0]) 
      });
      handleInputChange('hideUploadButton', true);
    }
  };

  // Clear error for a specific field
  const clearError = (field) => {
    if (errorMessages[field]) {
      setErrorMessages(prev => ({ ...prev, [field]: '' }));
    }
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

      const endpoint = formData.productDetailId 
        ? 'productdetail/update_productdetail' 
        : 'productdetail/submit_productdetail';

      const result = await postData(endpoint, formDataToSend);
      
      if (result.status) {
        showSuccess(result.message || 'Operation successful');
        handleCloseDialog();
        fetchAllProductDetail();
      } else {
        showError(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting product detail:', error);
      showError('An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!formData.productDetailId) return;

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const result = await postData('productdetail/delete_productdetail', {
        productdetailid: formData.productDetailId
      });

      if (result.status) {
        showSuccess('Product detail deleted successfully');
        handleCloseDialog();
        fetchAllProductDetail();
      } else {
        showError(result.message || 'Failed to delete product detail');
      }
    } catch (error) {
      console.error('Error deleting product detail:', error);
      showError('An error occurred while deleting');
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog open
  const handleOpenDialog = (rowData = null) => {
    if (rowData) {
      setFormData({
        categoryId: rowData.categoryid || '',
        subCategoryId: rowData.subcategoryid || '',
        brandId: rowData.brandid || '',
        productId: rowData.productid || '',
        productDetailId: rowData.productdetailid || '',
        productDetailName: rowData.productdetailname || '',
        weight: rowData.weight || '',
        weightType: rowData.weighttype || '',
        packagingType: rowData.packagingtype || '',
        noOfQty: rowData.noofqty || '',
        stock: rowData.stock || '',
        price: rowData.price || '',
        offerPrice: rowData.offerprice || '',
        offerType: rowData.offertype || '',
        productStatus: rowData.productstatus || '',
        productDetailDescription: rowData.productdetaildescription || '',
        productDetailPicture: { 
          bytes: '', 
          fileName: rowData.picture ? `${serverURL}/images/${rowData.picture}` : cart 
        },
        oldImage: rowData.picture || '',
        hideUploadButton: !!rowData.picture
      });

      // Fetch related data
      if (rowData.categoryid) fetchAllSubCategory(rowData.categoryid);
      if (rowData.subcategoryid) fetchAllBrand(rowData.subcategoryid);
      if (rowData.brandid) fetchAllProduct(rowData.brandid);
    } else {
      setFormData({
        categoryId: '',
        subCategoryId: '',
        brandId: '',
        productId: '',
        productDetailId: '',
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
        productDetailPicture: { bytes: '', fileName: cart },
        oldImage: '',
        hideUploadButton: false
      });
    }
    setOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpen(false);
    setErrorMessages({});
  };

  // Handle cancel picture upload
  const handleCancelPicture = () => {
    setFormData(prev => ({
      ...prev,
      productDetailPicture: { bytes: '', fileName: prev.oldImage ? `${serverURL}/images/${prev.oldImage}` : cart },
      hideUploadButton: false
    }));
  };

  // Render form
  const renderForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className={classes.mainHeadingStyle}>
          <img src={logo} alt="Logo" className={classes.imageStyle} />
          <div className={classes.headingStyle}>
            {formData.productDetailId ? 'Edit' : 'Add'} Product Detail
          </div>
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
              <MenuItem 
                key={`category-${item.categoryid}`} 
                value={item.categoryid}
              >
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
              <MenuItem 
                key={`subcategory-${item.subcategoryid}`} 
                value={item.subcategoryid}
              >
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
              <MenuItem 
                key={`brand-${item.brandid}`} 
                value={item.brandid}
              >
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
              <MenuItem 
                key={`product-${item.productid}`} 
                value={item.productid}
              >
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
            {PRODUCT_STATUSES.map((status) => (
              <MenuItem 
                key={`status-${status}`} 
                value={status}
              >
                {status}
              </MenuItem>
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
            {WEIGHT_TYPES.map((type) => (
              <MenuItem 
                key={`weight-${type}`} 
                value={type}
              >
                {type}
              </MenuItem>
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
            {PACKAGING_TYPES.map((type) => (
              <MenuItem 
                key={`packaging-${type}`} 
                value={type}
              >
                {type}
              </MenuItem>
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
            {OFFER_TYPES.map((type) => (
              <MenuItem 
                key={`offer-${type}`} 
                value={type}
              >
                {type}
              </MenuItem>
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
          {formData.hideUploadButton ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleCancelPicture}
              >
                Change
              </Button>
            </div>
          ) : (
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
          )}
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
    </Grid>
  );

  // Render the component
  return (
    <div className={classes.root}>
      <div className={classes.displayBox}>
        <MaterialTable
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Product Details</span>
              {loading && (
                <span style={{ marginLeft: 10, fontSize: 14, color: '#666' }}>
                  Loading...
                </span>
              )}
            </div>
          }
          columns={[
            { 
              title: 'ID', 
              field: 'productdetailid',
              render: rowData => (
                <div style={{ whiteSpace: 'nowrap' }}>
                  {rowData.productdetailid}
                </div>
              )
            },
            { 
              title: 'Product', 
              render: rowData => (
                <div>
                  <div style={{ fontWeight: 'bold' }}>{rowData.productdetailname}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {rowData.categoryname} / {rowData.subcategoryname}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {rowData.brandname} / {rowData.productname}
                  </div>
                </div>
              )
            },
            { 
              title: 'Details', 
              render: rowData => (
                <div>
                  <div>
                    <span style={{ fontWeight: '500' }}>Weight: </span>
                    {rowData.weight} {rowData.weighttype}
                  </div>
                  <div>
                    <span style={{ fontWeight: '500' }}>Packaging: </span>
                    {rowData.packagingtype}
                  </div>
                  <div>
                    <span style={{ fontWeight: '500' }}>Qty: </span>
                    {rowData.noofqty}
                  </div>
                </div>
              )
            },
            { 
              title: 'Pricing', 
              render: rowData => (
                <div>
                  <div>
                    <span style={{ fontWeight: '500' }}>Price: </span>
                    <span style={{ textDecoration: 'line-through' }}>₹{rowData.price}</span>
                    <span style={{ color: 'green', marginLeft: '8px' }}>₹{rowData.offerprice}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '500' }}>Offer: </span>
                    {rowData.offertype}
                  </div>
                  <div>
                    <span style={{ fontWeight: '500' }}>Stock: </span>
                    <span style={{ color: rowData.stock > 0 ? 'green' : 'red' }}>
                      {rowData.stock} {rowData.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              )
            },
            { 
              title: 'Status', 
              render: rowData => (
                <div style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  backgroundColor: rowData.productstatus === 'Active' ? '#e6f7e6' : '#fff3e0',
                  color: rowData.productstatus === 'Active' ? '#2e7d32' : '#e65100',
                  fontWeight: '500',
                  width: 'fit-content'
                }}>
                  {rowData.productstatus}
                </div>
              )
            },
            { 
              title: 'Image', 
              render: rowData => (
                <Avatar 
                  src={rowData.picture ? `${serverURL}/images/${rowData.picture}` : cart} 
                  variant="rounded"
                  sx={{ 
                    width: 60, 
                    height: 60,
                    border: '1px solid #ddd',
                    borderRadius: 2
                  }}
                />
              )
            }
          ]}
          data={lists.productDetailList}
          isLoading={loading}
          options={{
            pageSize: 10,
            pageSizeOptions: [5, 10, 25, 50],
            actionsColumnIndex: -1,
            emptyRowsWhenPaging: false,
            headerStyle: {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
            rowStyle: {
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }
          }}
          actions={[
            {
              icon: 'edit',
              tooltip: 'Edit Product Detail',
              onClick: (event, rowData) => handleOpenDialog(rowData)
            },
            {
              icon: 'add',
              tooltip: 'Add New Product Detail',
              isFreeAction: true,
              onClick: () => handleOpenDialog()
            }
          ]}
        />
      </div>

      <Dialog 
        open={open} 
        onClose={!loading ? handleCloseDialog : null}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {renderForm()}
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          {formData.productDetailId && (
            <Button 
              color="error" 
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button 
            onClick={handleCloseDialog}
            disabled={loading}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={loading}
            loadingPosition="start"
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {formData.productDetailId ? 'Update' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}