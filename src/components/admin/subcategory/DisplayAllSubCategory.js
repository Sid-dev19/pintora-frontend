import { userStyle } from "./SubCategoryCss"
import { useState, useEffect } from "react"
import MaterialTable from "@material-table/core"
import { getData, serverURL, createDate, postData, currentDate } from "../../../services/FetchNodeAdminServices"
import { Grid, TextField, Avatar, IconButton, Button, Dialog, DialogActions, DialogContent, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material"
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from "@mui/lab"
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import SaveIcon from '@mui/icons-material/Save';
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"

export default function DisplayAllSubCategory() {
  const navigate = useNavigate()
  const classes = userStyle()
  const [subCategoryList, setSubCategoryList] = useState([])
  const [open, setOpen] = useState(false)
  const [categoryList, setCategoryList] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryId: '',
    subCategoryName: '',
    subCategoryIcon: { bytes: '', fileName: cart },
    hideUploadButton: false,
    oldImage: ''
  })
  const [errorMessages, setErrorMessages] = useState({})

  // Fetch categories for dropdown
  const fetchAllCategory = async () => {
    try {
      const result = await getData('category/display_all_category')
      if (result?.data) {
        setCategoryList(result.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      showError("Failed to load categories")
    }
  }

  // Fetch subcategories
  const fetchAllSubCategory = async () => {
    setLoading(true)
    try {
      const result = await getData('subcategory/display_all_subcategory')
      if (result?.data) {
        setSubCategoryList(result.data)
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      showError("Failed to load subcategories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllCategory()
    fetchAllSubCategory()
  }, [])

  const showError = (message) => {
    Swal.fire({
      position: 'top',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 2000,
      toast: true
    })
  }

  const showSuccess = (message) => {
    Swal.fire({
      position: 'top',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 1500,
      toast: true
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errorMessages[field]) {
      setErrorMessages(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleInputChange('subCategoryIcon', { 
        bytes: e.target.files[0], 
        fileName: URL.createObjectURL(e.target.files[0]) 
      })
      handleInputChange('hideUploadButton', true)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.categoryId) errors.categoryId = 'Please select a category'
    if (!formData.subCategoryName.trim()) errors.subCategoryName = 'Please enter sub-category name'
    
    setErrorMessages(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const body = {
        categoryid: formData.categoryId,
        subcategoryname: formData.subCategoryName.trim(),
        updated_at: currentDate(),
        user_admin: 'Admin',
        ...(formData.subCategoryId && { subcategoryid: formData.subCategoryId })
      }

      const endpoint = formData.subCategoryId ? 'subcategory/edit_subcategory_data' : 'subcategory/subcategory_submit'
      const result = await postData(endpoint, body)
      
      if (result.status) {
        showSuccess(result.message || 'Operation successful')
        handleCloseDialog()
        fetchAllSubCategory()
      } else {
        showError(result.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Error submitting subcategory:', error)
      showError('An error occurred while processing your request')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!formData.subCategoryId) return

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })

    if (!confirm.isConfirmed) return

    setLoading(true)
    try {
      const result = await postData('subcategory/delete_subcategory', {
        subcategoryid: formData.subCategoryId
      })

      if (result.status) {
        showSuccess('Subcategory deleted successfully')
        handleCloseDialog()
        fetchAllSubCategory()
      } else {
        showError(result.message || 'Failed to delete subcategory')
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error)
      showError('An error occurred while deleting')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (rowData) => {
    if (rowData) {
      setFormData({
        categoryId: rowData.categoryid || '',
        subCategoryId: rowData.subcategoryid || '',
        subCategoryName: rowData.subcategoryname || '',
        subCategoryIcon: { 
          bytes: '', 
          fileName: rowData.subcategoryicon ? `${serverURL}/images/${rowData.subcategoryicon}` : cart 
        },
        hideUploadButton: !!rowData.subcategoryicon,
        oldImage: rowData.subcategoryicon ? `${serverURL}/images/${rowData.subcategoryicon}` : ''
      })
    } else {
      setFormData({
        categoryId: '',
        subCategoryId: '',
        subCategoryName: '',
        subCategoryIcon: { bytes: '', fileName: cart },
        hideUploadButton: false,
        oldImage: ''
      })
    }
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    setErrorMessages({})
  }

  const handleCancelIcon = () => {
    setFormData(prev => ({
      ...prev,
      subCategoryIcon: { bytes: '', fileName: prev.oldImage || cart },
      hideUploadButton: false
    }))
  }

  const renderForm = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className={classes.mainHeadingStyle}>
          <img src={logo} alt="Logo" className={classes.imageStyle} />
          <div className={classes.headingStyle}>
            {formData.subCategoryId ? 'Edit' : 'Add'} Sub Category
          </div>
        </div>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth error={!!errorMessages.categoryId}>
          <InputLabel>Category *</InputLabel>
          <Select
            value={formData.categoryId}
            label="Category *"
            onChange={(e) => handleInputChange('categoryId', e.target.value)}
          >
            {categoryList.map((category) => (
              <MenuItem key={category.categoryid} value={category.categoryid}>
                {category.categoryname}
              </MenuItem>
            ))}
          </Select>
          {errorMessages.categoryId && (
            <FormHelperText>{errorMessages.categoryId}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Sub Category Name *"
          value={formData.subCategoryName}
          onChange={(e) => handleInputChange('subCategoryName', e.target.value)}
          error={!!errorMessages.subCategoryName}
          helperText={errorMessages.subCategoryName}
        />
      </Grid>

      <Grid item xs={6} className={classes.center}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {formData.hideUploadButton ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleCancelIcon}
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
              Upload Icon
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleImage}
              />
            </Button>
          )}
          <div className={classes.errorMessageStyle}>
            {errorMessages.subCategoryIcon}
          </div>
        </div>
      </Grid>

      <Grid item xs={6} className={classes.center}>
        <Avatar 
          src={formData.subCategoryIcon.fileName} 
          variant="rounded"
          sx={{ width: 80, height: 80 }}
        />
      </Grid>
    </Grid>
  )

  return (
    <div className={classes.root}>
      <div className={classes.displayBox}>
        <MaterialTable
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Sub Categories</span>
              {loading && (
                <span style={{ marginLeft: 10, fontSize: 14, color: '#666' }}>
                  Loading...
                </span>
              )}
            </div>
          }
          columns={[
            { 
              title: 'Category', 
              field: 'categoryname',
              render: rowData => rowData.categoryname || 'N/A'
            },
            { 
              title: 'Sub-Category', 
              field: 'subcategoryname',
              render: rowData => rowData.subcategoryname || 'N/A'
            },
            { 
              title: 'Created At', 
              field: 'created_at',
              render: rowData => (
                <div style={{ whiteSpace: 'nowrap' }}>
                  {createDate(rowData.created_at)}
                </div>
              )
            },
            { 
              title: 'Icon', 
              field: 'subcategoryicon',
              render: rowData => (
                <Avatar 
                  src={rowData.subcategoryicon ? `${serverURL}/images/${rowData.subcategoryicon}` : cart} 
                  variant="rounded"
                  sx={{ width: 40, height: 40 }}
                />
              )
            },
          ]}
          data={subCategoryList}
          isLoading={loading}
          options={{
            pageSize: 10,
            pageSizeOptions: [5, 10, 20],
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
              tooltip: 'Edit Sub-Category',
              onClick: (event, rowData) => handleOpenDialog(rowData)
            },
            {
              icon: 'add',
              tooltip: 'Add New Sub-Category',
              isFreeAction: true,
              onClick: () => handleOpenDialog()
            }
          ]}
        />
      </div>

      <Dialog 
        open={open} 
        onClose={!loading ? handleCloseDialog : null}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {renderForm()}
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px' }}>
          {formData.subCategoryId && (
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
            {formData.subCategoryId ? 'Update' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}