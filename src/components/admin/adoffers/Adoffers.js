import { userStyle } from './AdofferCss';
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import { useState, useEffect } from "react";
import { postData, getData, currentDate } from "../../../services/FetchNodeAdminServices";
import { Grid, FormControl, Select, InputLabel, MenuItem, Button, Avatar, FormHelperText } from "@mui/material";
import Swal from "sweetalert2"
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from "@mui/lab";

export default function Adoffers(props) {
    var classes = userStyle()

    const [categoryId, setCategoryId] = useState('')
    const [subCategoryId, setSubCategoryId] = useState('')
    const [brandId, setBrandId] = useState('')
    const [productId, setProductId] = useState('')
    const [productDetailId, setProductDetailId] = useState('')
    const [categoryList, setCategoryList] = useState([])
    const [subCategoryList, setSubCategoryList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [productList, setProductList] = useState([])
    const [ProductDetailList, setProductDetailList] = useState([])
    const [fileName, setFileName] = useState({ bytes: [], fileName: cart })
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [errorMessages, setErrorMessages] = useState({})


    const handleErrorMessages = (label, message) => {
        var msg = errorMessages
        msg[label] = message
        setErrorMessages((prev) => ({ ...prev, ...msg }))

    }

    const validateData = () => {
        var err = false

        if (categoryId.length == 0) {
            handleErrorMessages('categoryId', 'Pls Select Category')
            err = true
        }

        if (subCategoryId.length == 0) {
            handleErrorMessages('subCategoryId', 'Pls Select Sub-Category')
            err = true
        }

        if (brandId.length == 0) {
            handleErrorMessages('brandId', 'Pls Select Brand')
            err = true
        }

        if (productId.length == 0) {
            handleErrorMessages('productId', 'Pls Select Product')
            err = true
        }

        if (productDetailId.length == 0) {
            handleErrorMessages('productDetailId', 'Pls Select Product Detail')
            err = true
        }
        if (fileName.bytes.length == 0) {
            handleErrorMessages('fileName', 'Pls Select Files...')
            err = true
        }

        return err
    }



    const showThumbnails = () => {
        return fileName?.bytes?.map((item, index) => (
            <div key={`thumbnail-${index}`} style={{ margin: 2, width: 30, height: 30, borderRadius: 5 }}>
                <img 
                    src={URL.createObjectURL(item)} 
                    style={{ width: 30, height: 30 }} 
                    alt={`Thumbnail ${index + 1}`}
                />
            </div>
        ));
    }


const handleImage = (e) => {
        handleErrorMessages('filenames', null)

        setFileName({
            bytes: Object.values(e.target.files),
            fileName: URL.createObjectURL(e.target.files[0])
        })
    }


    const resetValue = () => {
        setCategoryId('')
        setSubCategoryId('')
        setBrandId('')
        setProductId('')
        setProductDetailId('')
        setFileName({ bytes: [], fileName: cart })
    }


    const handleSubmit = async () => {
        var err = validateData()
        if (err == false) {

            setLoadingStatus(true)

            var formData = new FormData()

            formData.append('categoryid', categoryId)
            formData.append('subcategoryid', subCategoryId)
            formData.append('brandid', brandId)
            formData.append('productid', productId)
            formData.append('productdetailid', productDetailId)

            fileName?.bytes?.map((item,i)=>{
            formData.append('picture'+i,item)
            })

            formData.append('created_at', currentDate())
            formData.append('updated_at', currentDate())
            formData.append('user_admin', 'Farzi')

            var result = await postData('adoffers/adoffers_submit', formData)

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
            resetValue()
        }

    }



    /*********************************/
    const fetchAllCategory = async () => {
        var result = await getData('category/display_all_category')

        setCategoryList(result.data)
    }

    useEffect(function () {
        fetchAllCategory()
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

    const fillProduct = () => {
        return productList.map((item) => (
            <MenuItem key={`product-${item.productid}`} value={item.productid}>
                {item.productname}
            </MenuItem>
        ));
    }

    const fillProductDetail = () => {
        return ProductDetailList.map((item) => (
            <MenuItem key={`product-detail-${item.productdetailid}`} value={item.productdetailid}>
                {item.productdetailname}
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

    const handleProduct = (pid) => {

        setBrandId(pid)

        fetchAllProduct(pid)
    }

    const handleProductDetail = (pdid) => {

        setProductId(pdid)

        fetchAllProductDetail(pdid)
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

    const fetchAllProduct = async (pid) => {
        var body = { brandid: pid }
        var result = await postData('product/get_all_product_by_brandid', body)
        setProductList(result.data)
    }

    const fetchAllProductDetail = async (pdid) => {
        var body = { productid: pdid }
        var result = await postData('productdetail/get_all_productdetail_by_productid', body)
        setProductDetailList(result.data)
    }

    /*************************************/


    return (<div className={classes.root}>
        <div className={classes.box}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <div className={classes.mainHeadingstyle}>
                        <img src={logo} className={classes.imageStyle} />
                        <div className={classes.headingStyle}>
                           Ad Offers
                        </div>
                    </div>
                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select label='Category'
                            value={categoryId}
                            error={errorMessages?.categoryId}
                            onFocus={() => handleErrorMessages('categoryId', '')}

                            onChange={(e) => handleSubCategory(e.target.value)} >
                            {fillCategory()}

                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.categoryId}</div></FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <FormControl fullWidth>
                        <InputLabel>Sub-Category</InputLabel>
                        <Select label='Sub-Category'
                            value={subCategoryId}
                            error={errorMessages?.subCategoryId}
                            onFocus={() => handleErrorMessages('subCategoryId', '')}

                            onChange={(e) => handleBrand(e.target.value)} >
                            {fillSubCategory()}
                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.subCategoryId}</div></FormHelperText>
                    </FormControl>

                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth>
                        <InputLabel>Brand</InputLabel>
                        <Select label='Brand'
                            value={brandId}

                            error={errorMessages?.brandId}
                            onFocus={() => handleErrorMessages('brandId', '')}

                            onChange={(e) => handleProduct(e.target.value)}>
                            {fillBrand()}
                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.brandId}</div></FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth>
                        <InputLabel>Product</InputLabel>
                        <Select label='Product '
                            value={productId}
                            error={errorMessages?.productId}
                            onFocus={() => handleErrorMessages('productId', '')}
                            onChange={(e) => handleProductDetail(e.target.value)}>
                            {fillProduct()}
                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.productId}</div></FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <FormControl fullWidth>
                        <InputLabel>Product Detail</InputLabel>
                        <Select label='Product Detail'
                            value={productDetailId}

                            error={errorMessages?.productDetailId}
                            onFocus={() => handleErrorMessages('productDetailId', '')}
                            onChange={(e) => setProductDetailId(e.target.value)}>
                            {fillProductDetail()}
                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.productDetailId}</div></FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xs={6} className={classes.center}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button variant="contained" component='label' >Upload
                            <input onChange={handleImage} type="file" accept="image/*" hidden multiple />
                        </Button>

                        <div className={classes.errorMessageStyle}>{errorMessages?.fileName != null ? errorMessages?.fileName : <></>}</div>
                    </div>
                </Grid>
                <Grid item xs={6} className={classes.center}>
                    <div style={{ display: "flex" }}>
                        {showThumbnails()}
                    </div>
                </Grid>


                <Grid item xs={6} className={classes.center}>

                    <LoadingButton
                        loading={loadingStatus}
                        loadingPosition="start"
                        startIcon={<SaveIcon />}
                        variant="contained"
                        onClick={handleSubmit}
                    >
                        Save
                    </LoadingButton>
                </Grid>
                <Grid item xs={6} className={classes.center}>
                    <Button onClick={resetValue} variant="contained">Reset</Button>
                </Grid>

            </Grid>
        </div>
    </div>)
}