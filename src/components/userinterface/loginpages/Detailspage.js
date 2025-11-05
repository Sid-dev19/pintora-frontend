import { Paper, TextField } from "@mui/material"
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postData } from "../../../services/FetchNodeAdminServices";
import { useDispatch } from "react-redux";
import Snackbar from '@mui/material/Snackbar';

export default function Detailspage() {

    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [mobileno, setMobileNo] = useState(location.state.mobileno)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [gender, setGender] = useState('')
    const [emailAddress, setEmailAddress] = useState('')
    const [dob, setDob] = useState('')
    const [snackBar, setSnackBar] = useState({ open: false, message: '' })

    const handleSubmit = async () => {
        var body = { mobileno, firstname: firstName, lastname: lastName, emailaddress: emailAddress, gender, dob }
        var response = await postData('userinterface/submit_user_data', body)
        if (response.status) {
            body['userid'] = response.userid
            dispatch({ type: "ADD_USER", payload: [response?.userid, body] })
            setSnackBar({ message: response.message, open: true })
            navigate('/cartdisplaypage')
        }
        else {
            setSnackBar({ message: response.message, open: true })
        }
    }

    const handleClose = () => {
        setSnackBar({ message: '', open: false })
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Paper elevation={3} style={{ borderRadius: 24 }}>

                <div style={{ padding: 24, border: '1px solid #fff', borderRadius: 24, width: 354, height: 570, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        fontWeight: 900,
                        textTransform: 'none',
                        fontSize: 26,
                        letterSpacing: -.72,
                        lineHeight: 1.1666666667, marginBottom: 4
                    }}>Setup your account
                    </div>
                    <div style={{
                        fontWeight: 550,
                        textTransform: 'none',
                        fontSize: 16,
                        letterSpacing: -.08,
                        lineHeight: 1.5, color: 'rgba(0,0,0,.65)', marginBottom: 12
                    }}>
                        Seamless onboarding, quick checkouts, and faster deliveries across quickcomm and other Platforms.
                    </div>

                    <TextField onChange={(e) => setFirstName(e.target.value)} variant="standard" label="First Name" style={{ marginBottom: 24 }} />

                    <TextField onChange={(e) => setLastName(e.target.value)} variant="standard" label="Last Name" style={{ marginBottom: 24 }} />

                    <div style={{
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: 16,
                        letterSpacing: -.08,
                        lineHeight: 1.5, marginBottom: 4
                    }}>Gender
                    </div>

                    <FormControl>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                        >
                            <FormControlLabel onChange={(e) => setGender(e.target.value)} value="Male" control={<Radio />} label="Male" />
                            <FormControlLabel onChange={(e) => setGender(e.target.value)} value="Female" control={<Radio />} label="Female" />
                            <FormControlLabel onChange={(e) => setGender(e.target.value)} value="Other" control={<Radio />} label="Other" />

                        </RadioGroup>
                    </FormControl>

                    <TextField onChange={(e) => setEmailAddress(e.target.value)} variant="standard" label="Email ID" style={{ marginTop: 4, marginBottom: 8 }} />

                    <TextField onChange={(e) => setDob(e.target.value)} type="date" variant="standard" style={{ marginBottom: 26, marginTop: 4 }} />

                    <div style={{
                        border: '1px solid #fff', letterSpacing: -.08,
                        lineHeight: 1.5, borderRadius: 25, height: 50, backgroundColor: '#0f3cc9', color: '#fff', display: 'flex', justifyContent: 'center', fontSize: 18, fontWeight: 600, alignItems: 'center', marginBottom: 26
                    }}>
                        <LoadingButton
                            // loading="false"
                            loadingPosition="start"
                            //  startIcon={<SaveIcon />}
                            variant="text"
                        >
                            <div onClick={handleSubmit} style={{ color: '#fff', fontWeight: 600 }} >Continue</div>
                        </LoadingButton>

                    </div>
                    <div style={{
                        fontWeight: 550, textTransform: 'none', fontSize: 13, letterSpacing: -.06, lineHeight: 1.3333333333, color: 'rgba(0,0,0,.65)'
                    }}>
                        By continuing, you agree to our <span style={{ color: '#0a2885', marginLeft: 5 }}>Terms and Conditions of Use, Privacy Policy</span>
                        and <span style={{ color: '#0a2885' }}>Retail Account Privacy Policy.</span>

                    </div>
                </div>
            </Paper>


            < Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={snackBar.open}
                autoHideDuration={2000}
                onClose={handleClose}
                message={snackBar.message}

            />
        </div>
    )
}