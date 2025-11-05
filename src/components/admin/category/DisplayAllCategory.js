import { useState, useEffect } from "react"
import MaterialTable from "@material-table/core"
import { getData, serverURL, createDate } from "../../../services/FetchNodeAdminServices"
import { userStyle } from "./CategoryCss"
import { IconButton, Grid, TextField, Avatar, Dialog, DialogContent, DialogActions, Button } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import SaveIcon from '@mui/icons-material/Save';
import Swal from "sweetalert2"
import CloseIcon from '@mui/icons-material/Close';
import { postData, currentDate } from "../../../services/FetchNodeAdminServices"
import { useNavigate } from "react-router-dom"

export default function DisplayAllCategory() {

    const navigate = useNavigate()
    const classes = userStyle()
    const [categoryList, setCategoryList] = useState([])
    const [open, setOpen] = useState(false)

    /*******Start****/
    const [categoryId, setCategoryId] = useState('')
    const [categoryName, setCategoryaName] = useState('')
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [categoryIcon, setCategoryIcon] = useState({ bytes: '', fileName: cart })
    const [errorMessages, setErrorMessages] = useState({})
    const [hideUploadButton, setHideUploadButton] = useState(false)
    const [oldImage, setOldImage] = useState('')


    const handleErrorMessage = (label, message) => {
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
        if (categoryName.length == false) {
            handleErrorMessage('categoryName', 'Pls Input Category Name')
            err = true
        }
        /* if (categoryIcon.bytes.length == false) {
             handleErrorMessage('categoryIcon', 'Pls Select Category Icon ')
             err = true
         } */
        return err
    }

    function handleImage(e) {
        handleErrorMessage('categoryIcon', null)
        setCategoryIcon({ bytes: e.target.files[0], fileName: URL.createObjectURL(e.target.files[0]) })
        setHideUploadButton(true)
    }


    const categoryForm = () => {
        return (

            <Grid container spacing={2}>

                <Grid item xs={12}>
                    <div className={classes.mainHeadingstyle}>
                        <img src={logo} className={classes.imageStyle} />
                        <div className={classes.headingStyle}>
                            Category Register
                        </div>
                    </div>
                </Grid>

                <Grid item xs={12}>
                    <TextField onFocus={() => handleErrorMessage('categoryName', '')} error={errorMessages?.categoryName} helperText={errorMessages?.categoryName} onChange={(e) => setCategoryaName(e.target.value)} label="Category Name" value={categoryName} fullWidth />
                </Grid>

                <Grid item xs={6} className={classes.center}>
                    <div style={{ display: "flex", flexDirection: "column" }}>

                        {hideUploadButton ? <div>{showSaveCancelButton()}</div> :
                            <Button variant='contained' component='label' >Upload
                                <input onChange={handleImage} type="file" accept="image/*" hidden multiple />
                            </Button>}

                        <div className={classes.errorMessageStyle}>{errorMessages?.categoryIcon != null ? errorMessages.categoryIcon : <></>}</div>
                    </div>
                </Grid>
                <Grid item xs={6} className={classes.center}>
                    <Avatar src={categoryIcon.fileName} variant='rounded' style={{ width: 70, height: 70 }} />
                </Grid>

            </Grid>
        )
    }


    /****************/


    const fetchAllCategory = async () => {
        try {
            console.log('Fetching categories from:', `${serverURL}/category/display_all_category`);
            const result = await getData('category/display_all_category');
            console.log('Raw API Response:', result);
            
            // Check if result exists and has data
            if (result) {
                // Check if the data is in result.data or directly in result
                const data = result.data || result;
                
                // If data is an array, use it directly
                if (Array.isArray(data)) {
                    console.log('Categories loaded successfully:', data);
                    setCategoryList(data);
                } 
                // If data is an object with a results array
                else if (data && Array.isArray(data.results)) {
                    console.log('Categories loaded from results:', data.results);
                    setCategoryList(data.results);
                }
                // If data is an object with a different structure
                else if (data && typeof data === 'object') {
                    console.log('Categories loaded from object values:', Object.values(data));
                    setCategoryList(Object.values(data));
                }
                else {
                    console.warn('Unexpected data format:', data);
                    setCategoryList([]);
                }
            } else {
                console.error('Empty response from server');
                setCategoryList([]);
            }
        } catch (error) {
            console.error('Error in fetchAllCategory:', error);
            setCategoryList([]);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load categories. Please check console for details.',
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000
            });
        }
    }

    useEffect(function () {
        fetchAllCategory()
    }, [])

    const handleCloseDialog = () => {
        setOpen(false)
    }

    const handleCancelIcon = () => {
        setCategoryIcon({ bytes: '', fileName: oldImage })
        setHideUploadButton(false)
    }

    const handleOpenDialog = (rowData) => {
        setCategoryId(rowData.categoryid)
        setCategoryaName(rowData.categoryname)
        setCategoryIcon({ bytes: '', fileName: `${serverURL}/images/${rowData.categoryicon}` })
        setOldImage(`${serverURL}/images/${rowData.categoryicon}`)
        setOpen(true)
    }

    const handleEditData = async () => {

        var err = validateData()
        if (err == false) {

            setLoadingStatus(true)

            var body = { 'categoryname': categoryName, 'updated_at': currentDate(), 'user_admin': 'Farzi', categoryid: categoryId }

            var result = await postData('category/edit_category_data', body)
            if (result.status) {
                Swal.fire({
                    position: "top",
                    icon: 'success',
                    title: result.message,
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    customClass: {
                        icon: 'swal2-success swal2-icon-show',
                        iconContent: '✓'
                    }
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
        }
        fetchAllCategory()
    }


    const handleEditIcon = async () => {


        setLoadingStatus(true)

        var formData = new FormData()
        formData.append('categoryicon', categoryIcon.bytes)
        formData.append('updated_at', currentDate())
        formData.append('user_admin', 'Farzi')
        formData.append('categoryid', categoryId)



        var result = await postData('category/edit_category_icon', formData)
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
        fetchAllCategory()
    }

    const categoryDelete = async () => {
        setLoadingStatus(true)

        var body = { 'categoryid': categoryId }



        var result = await postData('category/delete_category', body)
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
        fetchAllCategory()

    }


    const handleDeleteCategory = async () => {

        Swal.fire({
            title: "Do you want to delete the category?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Delete",
            denyButtonText: `Don't delete`
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {

                categoryDelete()

            } else if (result.isDenied) {
                Swal.fire("category  not deleted", "", "info");
            }
        });

    }


    const showCategoryDialog = (rowData) => {
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

                    {categoryForm()}

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
                    <Button onClick={handleDeleteCategory} variant="contained" >Delete</Button>

                </DialogActions>
            </Dialog>
        </div>)

    }

    /******Table*****/

    function categoryTable() {
        return (

            <div className={classes.root}>
                <div className={classes.displayBox}>



                    <MaterialTable
                        title="Category List"
                        columns={[
                            { title: 'Category Id', field: 'categoryid' },
                            { title: 'Category Name', field: 'categoryname' },
                            { title: 'Created At', render: (rowData) => <div style={{ display: 'flex', flexDirection: 'column' }}><div>{createDate(rowData.created_at)}</div><div>{createDate(rowData.updated_at)}</div></div> },
                            { title: 'Admin', field: 'user_admin' },
                            { title: 'Icon', render: (rowData) => <div><img src={`${serverURL}/images/${rowData.categoryicon}`} style={{ width: 60, height: 60, borderRadius: 6 }} /></div> },
                        ]}

                        data={categoryList}
                        options={{
                            pageSize: 3,
                            pageSizeOptions: [3, 5, 10, categoryList.length],
                        }}
                        actions={[
                            {
                                icon: 'edit',
                                tooltip: 'Edit Category',
                                onClick: (event, rowData) => handleOpenDialog(rowData)
                            },
                            {
                                icon: 'add',
                                tooltip: 'Add User',
                                isFreeAction: true,
                                onClick: (event) => navigate('/dashboard/category')
                            }
                        ]}
                    />
                </div>
            </div>
        )
    }

    /***********/


    return (<div>
        {categoryTable()}
        {showCategoryDialog()}
    </div>)
}