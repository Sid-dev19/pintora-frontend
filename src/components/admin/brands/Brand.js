import { userStyle } from "./brandCss";
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import Swal from "sweetalert2"
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from "@mui/lab";
import { Button, Avatar, Grid, TextField, FormHelperText, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import { getData, postData, currentDate } from "../../../services/FetchNodeAdminServices";


export default function Brand(props) {
    var classes = userStyle()


    const [categoryId, setCategoryId] = useState('')
    const [subCategoryId, setSubCategoryId] = useState('')
    const [brandName, setBrandName] = useState('')
    const [brandIcon, setBrandIcon] = useState({ bytes: '', fileName: cart })
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [categoryList, setCategoryList] = useState([])
    const [subCategoryList, setSubCategoryList] = useState([])
    const [errorMessages, setErrorMessages] = useState({})

    const handleErrorMessages = (label, message) => {
        var msg = errorMessages
        msg[label] = message
        setErrorMessages((prev) => ({ ...prev, ...msg }))
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

        if (brandName.length == 0) {
            handleErrorMessages('brandName', 'Pls Input Brand Name')
            err = true
        }

        if (brandIcon.bytes.length == 0) {
            handleErrorMessages('brandIcon', 'Pls Select Brand Icon...')
            err = true
        }

        return err
    }

    const handleImage = (e) => {
        handleErrorMessages('brandIcon', null)
        setBrandIcon({ bytes: e.target.files[0], fileName: URL.createObjectURL(e.target.files[0]) })
    }

    const resetValue = () => {
        setCategoryId('')
        setSubCategoryId('')
        setBrandName('')
        setBrandIcon({ bytes: '', fileName: cart })
    }

    const handleSubmit = async () => {
        var err = validateData()
        if (err == false) {
            setLoadingStatus(true)

            var formData = new FormData()

            formData.append('categoryid', categoryId)
            formData.append('subcategoryid', subCategoryId)
            formData.append('brandname', brandName)
            formData.append('brandicon', brandIcon.bytes)
            formData.append('created_at', currentDate())
            formData.append('updated_at', currentDate())
            formData.append('user_admin', 'Farzi')

            var result = await postData('brand/brand_submit', formData)
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





    //**************/ 
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

    const handleSubCategory = (cid) => {

        setCategoryId(cid)

        fetchAllSubCategory(cid)

    }

    const fetchAllSubCategory = async (cid) => {

        var body = { categoryid: cid }

        var result = await postData('subcategory/get_all_subcategory_by_categoryid', body)

        setSubCategoryList(result.data)

    }

    const fillSubCategory = () => {

        return subCategoryList.map((item) => {
            return <MenuItem value={item.subcategoryid}>{item.subcategoryname}</MenuItem>
        })
    }
    /****************** */


    return (<div className={classes.root}>
        <div className={classes.box}>
            <Grid container spacing={2}>

                <Grid item xs={12}>
                    <div className={classes.mainHeadingstyle}>
                        <img src={logo} className={classes.imageStyle} />
                        <div className={classes.headingStyle}>
                            Brands Register
                        </div>
                    </div>
                </Grid>
                <Grid item xs={6}>
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
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel>Sub-Category Id</InputLabel>
                        <Select value={subCategoryId}
                            error={errorMessages?.subCategoryId}
                            onFocus={() => handleErrorMessages('subCategoryId', '')}

                            label='Sub-Category Id'
                            onChange={(e) => setSubCategoryId(e.target.value)}>
                            {fillSubCategory()}
                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.subCategoryId}</div></FormHelperText>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <TextField onFocus={() => handleErrorMessages('brandName', '')} error={errorMessages?.brandName} helperText={errorMessages?.brandName} onChange={(e) => setBrandName(e.target.value)} label='Brand Name' value={brandName} fullWidth />
                </Grid>

                <Grid item xs={6} className={classes.center}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button onChange={handleImage} variant="contained" component='label' >Upload
                            <input type="file" accept="image/*" hidden />
                        </Button>
                        <div className={classes.errorMessageStyle}>{errorMessages?.brandIcon != null ? errorMessages?.brandIcon : <></>}</div>
                    </div>
                </Grid>
                <Grid item xs={6} className={classes.center}>
                    <Avatar src={brandIcon.fileName} variant='rounded' style={{ width: 70, height: 70 }} />
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
                    <Button variant="contained" onClick={resetValue}>Reset</Button>
                </Grid>

            </Grid>
        </div>

    </div>)
}