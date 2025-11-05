import { useState, useEffect } from "react"
import MaterialTable from "@material-table/core"
import { getData, postData, currentDate, serverURL, createDate } from "../../../services/FetchNodeAdminServices"
import { userStyle } from "./brandCss"
import CloseIcon from '@mui/icons-material/Close';
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import Swal from "sweetalert2"
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from "@mui/lab";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogActions, Button, IconButton, Avatar, Grid, TextField, FormHelperText, FormControl, InputLabel, Select, MenuItem } from "@mui/material"


export default function DisplayAllBrand() {

    var navigate=useNavigate()
    var classes = userStyle()

    const [brandList, setBrandList] = useState([])
    const [open, setOpen] = useState(false)

    /****************************Brand Action*****************/

    const [categoryId, setCategoryId] = useState('')
    const [subCategoryId, setSubCategoryId] = useState('')
    const [brandId, setBrandId] = useState('')
    const [brandName, setBrandName] = useState('')
    const [brandIcon, setBrandIcon] = useState({ bytes: '', fileName: cart })
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [categoryList, setCategoryList] = useState([])
    const [subCategoryList, setSubCategoryList] = useState([])
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
            <Button onClick={handleEditIcon}>Save</Button>
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

        if (brandName.length == 0) {
            handleErrorMessages('brandName', 'Pls Input Brand Name')
            err = true
        }

        // if (brandIcon.bytes.length == 0) {
        //     handleErrorMessages('brandIcon', 'Pls Select Brand Icon...')
        //     err = true
        // }

        return err
    }

    const handleImage = (e) => {
        handleErrorMessages('brandIcon', null)
        setBrandIcon({ bytes: e.target.files[0], fileName: URL.createObjectURL(e.target.files[0]) })
        setHideUploadButton(true)
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


    const brandForm = () => {

        return (
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

                        {hideUploadButton ? <div>{showSaveCancelButton()}</div> :
                            <Button variant="contained" component='label' >Upload
                                <input onChange={handleImage} type="file" accept="image/*" hidden />
                            </Button>}

                        <div className={classes.errorMessageStyle}>{errorMessages?.brandIcon != null ? errorMessages?.brandIcon : <></>}</div>
                    </div>
                </Grid>
                <Grid item xs={6} className={classes.center}>
                    <Avatar src={brandIcon.fileName} variant='rounded' style={{ width: 70, height: 70 }} />
                </Grid>



            </Grid>
        )
    }

    /***************End*****************************/


    const fetchAllBrand = async () => {
        var result = await getData('brand/display_all_brand')
        if (result.status) {
            setBrandList(result.data)
        }
        else { alert(result.message) }
    }

    useEffect(function () {
        fetchAllBrand()
    }, [])

    const handleCloseDialog = () => {

        setOpen(false)
    }

    const handleCancelIcon = () => {
        setBrandIcon({ bytes: '', fileName: oldImage })
        setHideUploadButton(false)
    }

    const handleOpenDialog = (rowData) => {
        setCategoryId(rowData.categoryid)
        setSubCategoryId(rowData.subcategoryid)
        setBrandId(rowData.brandid)
        fetchAllSubCategory(rowData.categoryid)
        setBrandName(rowData.brandname)
        setBrandIcon({ bytes: '', fileName: `${serverURL}/images/${rowData.brandicon}` })
        setOldImage(`${serverURL}/images/${rowData.brandicon}`)
        setOpen(true)
    }

    const handleEditIcon = async () => {

        setLoadingStatus(true)
        var formData = new FormData()
        formData.append('brandicon', brandIcon.bytes)
        formData.append('updated_at', currentDate())
        formData.append('user_admin', 'Farzi')
        formData.append('brandid', brandId)

        var result = await postData('brand/edit_brand_icon', formData)
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

        fetchAllBrand()
    }


    const handleEditData = async () => {

        var err = validateData()

        if (err == false) {

            setLoadingStatus(true)


            var body = {

                'categoryid': categoryId,
                'subcategoryid': subCategoryId,
                'brandname': brandName,
                'updated_at': currentDate(),
                'user_admin': 'Farzi',
                'brandid': brandId
            }


            var result = await postData('brand/edit_brand_data', body)
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
        fetchAllBrand()
    }



    const brandDelete = async () => {
        setLoadingStatus(true)
        var body = {
            'brandid': brandId
        }

        var result = await postData('brand/delete_brand', body)
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

        fetchAllBrand()

    }

    const handleDeleteBrand = async () => {

        Swal.fire({
            title: "Do you want to delete the category?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Delete",
            denyButtonText: `Don't Delete`
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {

                brandDelete()

            } else if (result.isDenied) {
                Swal.fire("Brand Not Deleted", "", "info");
            }
        });

    }




    const showBrandDialog = () => {
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
                    {brandForm()}
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
                    <Button onClick={handleDeleteBrand} variant="contained">Delete</Button>

                </DialogActions>
            </Dialog>
        </div>)
    }

    /******************Table*********************/

    function brandTable() {
        return (
            <div className={classes.root}>
                <div className={classes.displayBox}>
                    <MaterialTable
                        title="Brand List"
                        columns={[
                            { title: 'Category Name', field: 'categoryname' },
                            { title: 'Sub-Category Name', field: 'subcategoryname' },
                            { title: 'Brand Id', field: 'brandid' },
                            { title: 'Brand Name', field: 'brandname' },
                            { title: 'Created At', render: (rowData) => <div style={{ display: 'flex', flexDirection: 'column' }}><div>{createDate(rowData.created_at)}</div><div>{createDate(rowData.updated_at)}</div></div> },
                            { title: 'Admin', field: 'user_admin' },
                            { title: 'Icon', render: (rowData) => <div><img src={`${serverURL}/images/${rowData.brandicon}`} style={{ width: 60, height: 60, borderRadius: 6 }} /></div> },

                        ]}
                        data={brandList}
                        options={{
                            pageSize: 3,
                            pageSizeOptions: [3, 5, 10, { value: brandList.length, label: 'All' }],
                        }}
                        actions={[
                            {
                                icon: 'edit',
                                tooltip: 'Edit',
                                onClick: (event, rowData) => handleOpenDialog(rowData)
                            },
                            {
                                icon: 'add',
                                tooltip: 'Add User',
                                isFreeAction:true,
                                onClick:(event)=>navigate('/dashboard/brand')
                            }
                        ]}
                    />
                </div>
            </div>
        )
    }

    /*******************END***********************/

    return (<div>
        {brandTable()}
        {showBrandDialog()}
    </div>)
}