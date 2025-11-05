import { useState, useEffect } from "react"
import MaterialTable from "@material-table/core"
import { getData, postData, currentDate, serverURL, createDate } from "../../../services/FetchNodeAdminServices"
import { userStyle } from "./ProductCss"
import { LoadingButton } from "@mui/lab";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import Swal from "sweetalert2"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from "react-router-dom";

import { 
    Dialog, 
    DialogContent, 
    DialogActions, 
    Button, 
    IconButton, 
    Avatar, 
    Grid, 
    TextField, 
    FormHelperText, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Box,
    Typography 
} from "@mui/material"


export default function DisplayAllProduct() {

    var navigate=useNavigate()
    var classes = userStyle()

    const [productList, setProductList] = useState([])
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    /************************Product Action******************************** */

    const [categoryId, setCategoryId] = useState('')
    const [subCategoryId, setSubCategoryId] = useState('')
    const [brandId, setBrandId] = useState('')
    const [productId, setProductId] = useState('')
    const [productName, setProductName] = useState('')
    const [productDescription, setProductDescription] = useState('')
    const [productPicture, setProductPricture] = useState({ bytes: '', fileName: cart })
    const [categoryList, setCategoryList] = useState([])
    const [subCategoryList, setSubCategoryList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [errorMessages, setErrorMessages] = useState({})
    const [hideUploadButton, setHideUploadButton] = useState(false)
    const [oldImage, setOldImage] = useState('')


    const handleErrorMessages = (label, message) => {
        var msg = errorMessages
        msg[label] = message
        setErrorMessages((prev) => ({ ...prev, ...msg }))
    }

    const showSaveCancelButton = () => {
        return (<div>
            <Button onClick={handleEditPicture}>Save</Button>
            <Button onClick={handleCancelIcon}>Cancel</Button>
        </div>)
    }

    const validateData = () => {
        var err = false

        if (categoryId.length == 0) {
            handleErrorMessages('categoryId', 'Pls Input Category Id')
            err = true
        }

        if (subCategoryId.length == 0) {
            handleErrorMessages('subCategoryId', 'Pls Input Sub-Category Name')
            err = true
        }

        if (brandId.length == 0) {
            handleErrorMessages('brandId', 'Pls Input Brand Id')
            err = true
        }

        if (productName.length == 0) {
            handleErrorMessages('productName', 'Pls Input Product Name')
            err = true
        }

        if (productDescription.length == 0) {
            handleErrorMessages('productDescription', 'Pls Input Product Description')
            err = true
        }

        // if (productPicture.bytes.length == 0) {
        //     handleErrorMessages('productPicture', 'Pls Select Picture...')
        //     err = true
        // }

        return err
    }


    const handleImage = (e) => {
        handleErrorMessages('productPicture', null)
        setProductPricture({ bytes: e.target.files[0], fileName: URL.createObjectURL(e.target.files[0]) })
        setHideUploadButton(true)
    }



    /*********************************/
    const fetchAllCategory = async () => {
        var result = await getData('category/display_all_category')

        setCategoryList(result.data)
    }

    useEffect(function () {
        fetchAllCategory()
    }, [])



    const fetchAllSubCategoryData = async () => {

        var result = await getData('subcategory/display_all_subcategory')

        console.log(result.data)

        setSubCategoryList(result.data)

    }

    useEffect(function () {
        fetchAllSubCategoryData()
    }, [])

    const fillCategory = () => {
        return categoryList.map((item) => (
            <MenuItem key={`category-${item.categoryid}`} value={item.categoryid}>
                {item.categoryname}
            </MenuItem>
        ));
    }

    const fillSubCategory = () => {
        return subCategoryList.map((item) => (
            <MenuItem key={`subcategory-${item.subcategoryid}`} value={item.subcategoryid}>
                {item.subcategoryname}
            </MenuItem>
        ));
    }

    const fillBrand = () => {
        return brandList.map((item) => (
            <MenuItem key={`brand-${item.brandid}`} value={item.brandid}>
                {item.brandname}
            </MenuItem>
        ));
    }


    const handleSubCategory = (cid) => {

        setCategoryId(cid)

        fetchAllSubCategory(cid)

    }

    const handleBrand = (sid) => {
        setSubCategoryId(sid)
        fetchAllBrand(sid)

    }


    const fetchAllSubCategory = async (cid) => {

        var body = { categoryid: cid }

        var result = await postData('subcategory/get_all_subcategory_by_categoryid', body)

        setSubCategoryList(result.data)

    }



    const fetchAllBrand = async (sid) => {

        var body = { subcategoryid: sid }

        var result = await postData('brand/get_all_brand_by_subcategoryid', body)

        setBrandList(result.data)

    }


    /*************************************/



    const productForm = () => {

        return (
            <Grid container spacing={2}>

                <Grid item xs={12}>
                    <div className={classes.mainHeadingstyle}>
                        <img src={logo} className={classes.imageStyle} />
                        <div className={classes.headingStyle}>
                            Products Register
                        </div>
                    </div>
                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Category Id</InputLabel>
                        <Select value={categoryId}
                            error={errorMessages?.categoryId}
                            onFocus={() => handleErrorMessages('categoryId', '')}
                            label='Category Id'
                            onChange={(e) => handleSubCategory(e.target.value)}>
                            {fillCategory()}

                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.categoryId}</div></FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Sub-Category Id</InputLabel>
                        <Select value={subCategoryId}
                            error={errorMessages?.subCategoryId}
                            onFocus={() => handleErrorMessages('subCategoryId', '')}

                            label='Sub-Category Id'
                            onChange={(e) => handleBrand(e.target.value)}>
                            {fillSubCategory()}
                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.subCategoryId}</div></FormHelperText>
                    </FormControl>

                </Grid>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Brand Id</InputLabel>
                        <Select value={brandId}
                            error={errorMessages?.brandId}
                            onFocus={() => handleErrorMessages('brandId', '')}
                            label='Brand Id'
                            onChange={(e) => setBrandId(e.target.value)}>
                            {fillBrand()}
                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.brandId}</div></FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField onFocus={() => handleErrorMessages('productName', '')} error={errorMessages?.productName} helperText={errorMessages?.productName} value={productName} onChange={(e) => setProductName(e.target.value)} label='Product Name' fullWidth />
                </Grid>
                <Grid item xs={12}>
                    {/* <TextField onFocus={() => handleErrorMessages('productDescription', '')} error={errorMessages?.productDescription} helperText={errorMessages?.productDescription} value={productDescription} onChange={(e) => setProductDescription(e.target.value)} label='Product Descriptions' fullWidth /> */}
                    <ReactQuill
               placeholder="Product Description"
                modules={{
                toolbar: {
                 container: [
                      [{ header: "1" }, { header: "2" }, { font: [] }],
                      [{ size: [] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [
                        { list: "ordered" },
                        { list: "bullet" },
                        { indent: "-1" },
                      { indent: "+1" },
                      ],
                      ["link", "image", "video"],
                      ["code-block"],
                     ["clean"],
                ],
                  },
                  clipboard: {
                    matchVisual: false,
               },
               }}
                formats={[
                "header",
                 "font",
                  "size",
                 "bold",
                  "italic",
                 "underline",
                 "strike",
                 "blockquote",
                  "list",
                 "bullet",
                 "indent",
                  "link",
                 "image",
                  "video",
                "code-block",
                ]}
             
            theme="snow"  value={productDescription} onChange={setProductDescription} />


                </Grid>


                <Grid item xs={6} className={classes.center}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>\

                        {hideUploadButton ? <div>{showSaveCancelButton()}</div> :
                            <Button variant="contained" component='label' >Upload
                                <input onChange={handleImage} type="file" accept="image/*" hidden />
                            </Button>}

                        <div className={classes.errorMessageStyle}>{errorMessages?.productPicture != null ? errorMessages?.productPicture : <></>}</div>
                    </div>
                </Grid>
                <Grid item xs={6} className={classes.center}>
                    <Avatar src={productPicture.fileName} variant='rounded' style={{ width: 70, height: 70 }} />
                </Grid>

            </Grid>
        )
    }

    /************************End******************************** */

    const fetchAllProduct = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching products...');
            var result = await getData('product/display_all_product');
            console.log('API Response:', result);

            // Handle case where data is directly in the response
            if (Array.isArray(result)) {
                console.log('Products data (direct array):', result);
                setProductList(result);
                return;
            }

            // Handle case where data is in result.data
            if (result && Array.isArray(result.data)) {
                console.log('Products data (in result.data):', result.data);
                setProductList(result.data);
                return;
            }

            // Handle case where there's a message but no data
            if (result && result.message) {
                console.log('API Message:', result.message);
                // If we have a message but no data, set empty array
                if (!result.data) {
                    console.warn('No products data found in response');
                    setProductList([]);
                    return;
                }
            }

            // If we get here, the response format is unexpected
            console.warn('Unexpected response format:', result);
            setProductList([]);
            
        } catch (error) {
            console.error('Error in fetchAllProduct:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load products. Please try again later.',
                timer: 3000
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(function () {
        fetchAllProduct()
    }, [])

    const handleCloseDialog = () => {
        setOpen(false)
    }

    const handleCancelIcon = () => {
        setProductPricture({ bytes: '', fileName: oldImage })
        setHideUploadButton(false)
    }


    const handleEditData = async () => {
        var err = validateData()

        if (err == false) {
            setLoadingStatus(true)
            var body = {

                'categoryid': categoryId,
                'subcategoryid': subCategoryId,
                'brandid': brandId,
                'productname': productName,
                'productdescription': productDescription,
                'updated_at': currentDate(),
                'user_admin': 'Farzi',
                'productid': productId

            }


            var result = await postData('product/edit_product_data', body)
            if (result.status) {
                Swal.fire({
                    position: "top",
                    icon: "success",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            else {
                Swal.fire({
                    position: "top",
                    icon: "error",
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            setLoadingStatus(false)
        }
        fetchAllProduct()
    }


    const handleEditPicture = async () => {

        setLoadingStatus(true)
        var formData = new FormData()
        formData.append('picture', productPicture.bytes)
        formData.append('updated_at', currentDate())
        formData.append('user_admin', 'Farzi')
        formData.append('productid', productId)

        var result = await postData('product/edit_product_picture', formData)
        if (result.status) {
            Swal.fire({
                position: "top",
                icon: "success",
                title: result.message,
                showConfirmButton: false,
                timer: 1500,
                toast: true
            });
        }
        else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: result.message,
                showConfirmButton: false,
                timer: 1500,
                toast: true
            });
        }
        setLoadingStatus(false)

        setHideUploadButton(false)

        fetchAllProduct()
    }


    const productDelete = async () => {

        setLoadingStatus(true)
        var body = { 'productid': productId }


        var result = await postData('product/delete_product', body)
        if (result.status) {
            Swal.fire({
                position: "top",
                icon: "success",
                title: result.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
        else {
            Swal.fire({
                position: "top",
                icon: "error",
                title: result.message,
                showConfirmButton: false,
                timer: 1500
            });
        }
        setLoadingStatus(false)
        setHideUploadButton(false)
        fetchAllProduct()
    }


    const handleDeleteProduct = async () => {

        Swal.fire({
            title: "Do you want to delete the Product?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Delete",
            denyButtonText: `Don't Delete`
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {

                productDelete()

            } else if (result.isDenied) {
                Swal.fire("Brand Not Deleted", "", "info");
            }
        });


    }



    const handleOpenDialog = (rowData) => {
        setCategoryId(rowData.categoryid)
        setSubCategoryId(rowData.subcategoryid)
        setBrandId(rowData.brandid)
        setProductId(rowData.productid)
        fetchAllBrand(rowData.subcategoryid)
        setProductName(rowData.productname)
        setProductDescription(rowData.productdescription)
        setProductPricture({ bytes: '', fileName: `${serverURL}/images/${rowData.picture}` })
        setOldImage(`${serverURL}/images/${rowData.picture}`)
        setOpen(true)

    }

    const showProductDialog = () => {

        return (<div>
            <Dialog open={open}>
                <IconButton
                    aria-label="close"
                    onClick={handleCloseDialog}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    {productForm()}

                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        loading={loadingStatus}
                        loadingPosition="start"
                        startIcon={<SaveIcon />}
                        variant="contained"
                        onClick={handleEditData}
                    >

                        Edit Data
                    </LoadingButton>
                    <Button onClick={handleDeleteProduct} variant="contained">Delete</Button>

                </DialogActions>
            </Dialog>
        </div>)

    }


    /******************Table*********************/

    function productTable() {
        if (isLoading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                    <CircularProgress />
                    <Box ml={2}>
                        <Typography>Loading products...</Typography>
                    </Box>
                </Box>
            );
        }

        return (
            <div className={classes.root}>
                <div className={classes.displayBox}>
                    <MaterialTable
                        title={
                            <Box display="flex" alignItems="center">
                                <Typography variant="h6">Products List</Typography>
                                {productList.length > 0 && (
                                    <Typography variant="body2" color="textSecondary" style={{ marginLeft: '10px' }}>
                                        ({productList.length} items)
                                    </Typography>
                                )}
                            </Box>
                        }
                        columns={[
                            {
                                title: 'Product',
                                field: 'productname',
                                render: (rowData) => (
                                    <Box display="flex" alignItems="center">
                                        <Avatar 
                                            src={`${serverURL}/images/${rowData.picture}`} 
                                            variant="rounded"
                                            style={{ 
                                                width: 50, 
                                                height: 50, 
                                                marginRight: 10,
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = cart;
                                            }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{rowData.productname}</div>
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>ID: {rowData.productid}</div>
                                        </div>
                                    </Box>
                                )
                            },
                            { 
                                title: 'Category', 
                                field: 'categoryname',
                                render: (rowData) => (
                                    <div>
                                        <div><strong>Category:</strong> {rowData.categoryname || 'N/A'}</div>
                                        <div><strong>Subcategory:</strong> {rowData.subcategoryname || 'N/A'}</div>
                                        <div><strong>Brand:</strong> {rowData.brandname || 'N/A'}</div>
                                    </div>
                                )
                            },
                            { 
                                title: 'Dates',
                                field: 'created_at',
                                render: (rowData) => (
                                    <div>
                                        <div><strong>Created:</strong> {createDate(rowData.created_at) || 'N/A'}</div>
                                        <div><strong>Updated:</strong> {createDate(rowData.updated_at) || 'N/A'}</div>
                                    </div>
                                )
                            },
                            { 
                                title: 'Admin', 
                                field: 'user_admin',
                                render: (rowData) => rowData.user_admin || 'N/A'
                            }
                        ]}
                        data={productList}
                        options={{
                            pageSize: 10,
                            pageSizeOptions: [5, 10, 20],
                            emptyRowsWhenPaging: false,
                            showEmptyDataSourceMessage: true,
                            search: true,
                            searchFieldAlignment: 'left',
                            headerStyle: {
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold',
                            },
                            rowStyle: {
                                verticalAlign: 'top'
                            },
                            emptyDataSourceMessage: 'No products found. Click the + button to add a new product.'
                        }}
                        actions={[
                            {
                                icon: 'edit',
                                tooltip: 'Edit Product',
                                onClick: (event, rowData) => handleOpenDialog(rowData)
                            },
                            {
                                icon: 'add',
                                tooltip: 'Add New Product',
                                isFreeAction: true,
                                onClick: () => navigate('/dashboard/product')
                            }
                        ]}
                        localization={{
                            toolbar: {
                                searchPlaceholder: 'Search products...',
                                nRowsSelected: '{0} row(s) selected'
                            },
                            pagination: {
                                labelRowsSelect: 'rows',
                                labelDisplayedRows: '{from}-{to} of {count}'
                            },
                            body: {
                                emptyDataSourceMessage: 'No products to display',
                                addTooltip: 'Add new product',
                                deleteTooltip: 'Delete product',
                                editTooltip: 'Edit product',
                                filterRow: {
                                    filterTooltip: 'Filter'
                                }
                            }
                        }}
                    />
                </div>
            </div>
        );
    }
    /*******************END***********************/

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
                <Box ml={2}>
                    <Typography>Loading products...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <div>
            {productTable()}
            {showProductDialog()}
        </div>
    );
}