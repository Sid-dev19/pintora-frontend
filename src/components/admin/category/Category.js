import { Button, Grid, TextField, Avatar } from "@mui/material"
import { LoadingButton } from "@mui/lab"
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import SaveIcon from '@mui/icons-material/Save';
import { useState } from "react"
import Swal from "sweetalert2"
import { userStyle } from "./CategoryCss";
import { postData, currentDate } from "../../../services/FetchNodeAdminServices"

export default function Category(props) {

    var classes = userStyle()
    const [categoryName, setCategoryaName] = useState('')
    const [loadingStatus, setLoadingStatus] = useState(false)
    const [categoryIcon, setCategoryIcon] = useState({ bytes: '', fileName: cart })
    const [errorMessages, setErrorMessages] = useState({})

    const handleErrorMessage = (label, message) => {
        var msg = errorMessages
        msg[label] = message
        setErrorMessages((prev) => ({ ...prev, ...msg }))
    }

    const validateData = () => {
        var err = false
        if (categoryName.length == false) {
            handleErrorMessage('categoryName', 'Pls Input Category Name')
            err = true
        }
        if (categoryIcon.bytes == false) {
            handleErrorMessage('categoryIcon', 'Pls Select Category Icon ')
            err = true
        }
        return err
    }

    function handleImage(e) {
        handleErrorMessage('categoryIcon', null)
        setCategoryIcon({ bytes: e.target.files[0], fileName: URL.createObjectURL(e.target.files[0]) })
    }

    const resetValue = () => {
        setCategoryaName('')
        setCategoryIcon({ bytes: (''), fileName: cart })

    }


    const handleSubmit = async () => {

        var err = validateData()

        if (err == false) {

            setLoadingStatus(true)

            var formData = new FormData()

            formData.append('categoryname', categoryName)
            formData.append('categoryicon', categoryIcon.bytes)
            formData.append('created_at', currentDate())
            formData.append('updated_at', currentDate())
            formData.append('user_admin', 'Farzi')


            var result = await postData('category/category_submit', formData)
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

    const handleReset = () => {
        resetValue()
    }


    return (<div className={classes.root}>

        <div className={classes.box}>

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
                        <Button variant='contained' component='label' >Upload
                            <input onChange={handleImage} type="file" accept="image/*" hidden multiple />
                        </Button>
                        <div className={classes.errorMessageStyle}>{errorMessages?.categoryIcon != null ? errorMessages.categoryIcon : <></>}</div>
                    </div>
                </Grid>

                <Grid item xs={6} className={classes.center}>
                    <Avatar src={categoryIcon.fileName} variant='rounded' style={{ width: 70, height: 70 }} />
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
                    <Button onClick={handleReset} variant="contained" >Reset</Button>
                </Grid>

            </Grid>
        </div>
    </div>)
}