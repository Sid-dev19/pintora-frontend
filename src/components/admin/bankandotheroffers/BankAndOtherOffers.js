import { userStyle } from './BankAndOtherOfferCss';
import logo from '../../../assets/logo.png'
import cart from '../../../assets/cart.png'
import { useState, useEffect } from "react";
import { postData, getData, currentDate } from "../../../services/FetchNodeAdminServices";
import { Grid, FormControl, Select, InputLabel, MenuItem, Button, Avatar, FormHelperText } from "@mui/material";
import Swal from "sweetalert2"
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from "@mui/lab";

export default function BankAndOtherOffer(props) {
    var classes = userStyle()

    const [status, setStatus] = useState('')
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

        if (status.length == 0) {
            handleErrorMessages('status', 'Pls Select Status')
            err = true
        }

        if (fileName.bytes.length == 0) {
            handleErrorMessages('fileName', 'Pls Select Files...')
            err = true
        }

        return err
    }


    const showThumbnails = () => {
        return fileName?.bytes?.map((item) => {
            return (<div style={{ margin: 2, width: 30, height: 30, borderRadius: 5 }}>
                <img src={URL.createObjectURL(item)} style={{ width: 30, height: 30 }} />
            </div>)
        })
    }


    const handleImage = (e) => {
        handleErrorMessages('filenames', null)
        setFileName({
            bytes: Object.values(e.target.files),
            fileName: URL.createObjectURL(e.target.files[0])
        })
    }



    const handleSubmit = async () => {
        var err = validateData()
        if (err == false) {

            setLoadingStatus(true)

            var formData = new FormData()

            formData.append('status', status)

            fileName?.bytes?.map((item, i) => {
                formData.append('picture' + i, item)
            })



            var result = await postData('bankandotheroffer/bankandotheroffer_submit', formData)

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





    const resetValue = () => {
        setStatus('')
        setFileName({ bytes: [], fileName: cart })
    }

    return (<div className={classes.root}>
        <div className={classes.box}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <div className={classes.mainHeadingstyle}>
                        <img src={logo} className={classes.imageStyle} />
                        <div className={classes.headingStyle}>
                            Bank And Other  Offer
                        </div>
                    </div>
                </Grid>

                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel >Product Status</InputLabel>
                        <Select label="Product Status"
                            value={status}
                            error={errorMessages?.status}
                            onFocus={() => handleErrorMessages('status', '')}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value='Show'>Show</MenuItem>
                            <MenuItem value='Hide'>Hide</MenuItem>
                            <MenuItem value='Expire'>Expire</MenuItem>

                        </Select>
                        <FormHelperText><div className={classes.errorMessageStyle}>{errorMessages?.status}</div></FormHelperText>
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