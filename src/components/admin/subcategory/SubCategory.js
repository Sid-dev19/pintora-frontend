import { userStyle } from "./SubCategoryCss"
import { FormControl, InputLabel, Select, MenuItem, Grid, TextField, Avatar, Button, FormHelperText } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import SaveIcon from '@mui/icons-material/Save';
import { useState } from "react"
import Swal from "sweetalert2"
import { useEffect } from "react"
import { postData, currentDate, getData } from "../../../services/FetchNodeAdminServices"


export default function SubCategory(props) {

    const [categoryId, setCategoryId] = useState('')
    const [subCategoryName, setSubCategoryName] = useState('')
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [subCategoryIcon, setSubCategoryIcon] = useState({ bytes: '', fileName: cart })
    const [errorMessages, setErrorMessages] = useState({})
    const [categoryList, setCategoryList] = useState([])

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

        if (subCategoryName.length == 0) {
            handleErrorMessages('subCategoryName', 'Pls Input Sub-Category Name')
            err = true
        }

        if (subCategoryIcon.bytes.length == 0) {
            handleErrorMessages('subCategoryIcon', 'Pls Select Sub-Category Icon...')
            err = true
        }

        return err
    }

    const handleImage = (e) => {
        handleErrorMessages('subCategoryIcon', null)
        setSubCategoryIcon({ bytes: e.target.files[0], fileName: URL.createObjectURL(e.target.files[0]) })
    }

    const resetValue = () => {
        setCategoryId('')
        setSubCategoryName('')
        setSubCategoryIcon({ bytes: '', fileName: cart })
    }

    const handleSubmit = async () => {
        var err = validateData()

        if (err == false) {
            setLoadingStatus(true)
            var formData = new FormData()
            formData.append('categoryid', categoryId)
            formData.append('subcategoryname', subCategoryName)
            formData.append('subcategoryicon', subCategoryIcon.bytes)
            formData.append('created_at', currentDate())
            formData.append('updated_at', currentDate())
            formData.append('user_admin', 'Farzi')

            var result = await postData('subcategory/subcategory_submit', formData)
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
            resetValue()
        }
    }

    const handleReset = () => {
        resetValue()
    }

    var classes = userStyle()
    return (<div>
        <div className={classes.root}>
            <div className={classes.box}>

                <Grid container spacing={2}>

                    <Grid item xs={12}>
                        <div className={classes.mainHeadingStyle}>
                            <img src={logo} className={classes.imageStyle} />
                            <div className={classes.headingStyle}>
                                Sub Category Register
                            </div>
                        </div>
                    </Grid>



                    <Grid item xs={12}>
                        {/* <TextField onFocus={() => handleErrorMessages('categoryId', '')} error={errorMessages?.categoryId} helperText={errorMessages?.categoryId} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} label='Category Id' fullWidth /> */}

                        <FormControl fullWidth>
                            <InputLabel>Category Id</InputLabel>
                            <Select value={categoryId}
                           error={errorMessages?.categoryId}
                                onFocus={() => handleErrorMessages('categoryId', '')}
                                label='Category Id'
                                onChange={(e) => setCategoryId(e.target.value)}
                            >
                                {fillCategory()}

                            </Select>
                            <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.categoryId}</div></FormHelperText>
                        </FormControl>

                    </Grid>

                    <Grid item xs={12}>
                        <TextField onFocus={() => handleErrorMessages('subCategoryName', '')} error={errorMessages?.subCategoryName} helperText={errorMessages?.subCategoryName} value={subCategoryName} onChange={(e) => setSubCategoryName(e.target.value)} label='Sub Category Name' fullWidth />
                    </Grid>

                    <Grid item xs={6} className={classes.center}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <Button variant="contained" component='label'>Upload
                                <input onChange={handleImage} type="file" accept="image/*" hidden />
                            </Button>
                            <div className={classes.errorMessageStyle}>{errorMessages?.subCategoryIcon != null ? errorMessages?.subCategoryIcon : <></>}</div>
                        </div>
                    </Grid>
                    <Grid item xs={6} className={classes.center}>
                        <Avatar src={subCategoryIcon.fileName} style={{ width: 70, height: 70 }} variant="rounded" />
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
                        <Button onClick={handleReset} variant="contained">Reset</Button>
                    </Grid>

                </Grid>

            </div>
        </div>
    </div>)
}