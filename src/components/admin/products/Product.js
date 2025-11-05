import { userStyle } from "./ProductCss";
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import Swal from "sweetalert2"
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from "@mui/lab";
import { useState, useEffect } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getData, postData, currentDate } from "../../../services/FetchNodeAdminServices";
import { Button, Avatar, Grid, FormHelperText, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";

export default function Product(props) {
    var classes = userStyle()

    const [categoryId, setCategoryId] = useState('')
    const [subCategoryId, setSubCategoryId] = useState('')
    const [brandId, setBrandId] = useState('')
    const [productName, setProductName] = useState('')
    const [productDescription, setProductDescription] = useState('')
    const [productPicture, setProductPicture] = useState({ bytes: '', fileName: cart })
    const [categoryList, setCategoryList] = useState([])
    const [subCategoryList, setSubCategoryList] = useState([])
    const [brandList, setBrandList] = useState([])
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

        if (productName.length == 0) {
            handleErrorMessages('productName', 'Pls Input Product Name')
            err = true
        }

        if (productDescription.length == 0) {
            handleErrorMessages('productDescription', 'Pls Input Product Description')
            err = true
        }

        if (productPicture.bytes.length == 0) {
            handleErrorMessages('productPicture', 'Pls Select Picture...')
            err = true
        }

        return err
    }


    const handleImage = (e) => {
        handleErrorMessages('productPicture', null)
        setProductPicture({ bytes: e.target.files[0], fileName: URL.createObjectURL(e.target.files[0]) })
    }



    const handleSubmit = async () => {
        var err = validateData()
        if (err == false) {

            setLoadingStatus(true)
            var formData = new FormData()

            formData.append('categoryid', categoryId)
            formData.append('subcategoryid', subCategoryId)
            formData.append('brandid', brandId)
            formData.append('productname', productName)
            formData.append('productdescription', productDescription)
            formData.append('picture', productPicture.bytes)
            formData.append('created_at', currentDate())
            formData.append('updated_at', currentDate())
            formData.append('user_admin', 'Farzi')

            var result = await postData('product/product_submit', formData)

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
            handleReset()
        }
    }

    const handleReset = () => {
        setCategoryId('')
        setSubCategoryId('')
        setBrandId('')
        setProductName('')
        setProductDescription('')
        setProductPicture({ bytes: '', fileName: cart })
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
        return categoryList.map((item) => {
            return <MenuItem value={item.categoryid}>{item.categoryname}</MenuItem>
        })
    }

    const fillSubCategory = () => {

        return subCategoryList.map((item) => {
            return <MenuItem value={item.subcategoryid}>{item.subcategoryname}</MenuItem>
        })
    }

    const fillBrand = () => {

        return brandList.map((item) => {
            return <MenuItem value={item.brandid}>{item.brandname}</MenuItem>
        })
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

    return (<div className={classes.root}>
        <div className={classes.box}>
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button variant="contained" component='label' >Upload
                            <input onChange={handleImage} type="file" accept="image/*" hidden />
                        </Button>

                        <div className={classes.errorMessageStyle}>{errorMessages?.productPicture != null ? errorMessages?.productPicture : <></>}</div>
                    </div>
                </Grid>
                <Grid item xs={6} className={classes.center}>
                    <Avatar src={productPicture.fileName} variant='rounded' style={{ width: 70, height: 70 }} />
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
                    <Button variant="contained" onClick={handleReset} >Reset</Button>
                </Grid>


            </Grid>
        </div>
    </div>)
}