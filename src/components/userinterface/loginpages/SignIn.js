import { Box, Button, Paper, TextField } from "@mui/material";
import React, { useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
import jiomart from '../../../assets/Jiomart.png'
import logo from '../../../assets/logo.png'
import { postData } from "../../../services/FetchNodeAdminServices";
import Swal from "sweetalert2";

export default function SignIn() {

    var navigate = useNavigate()

    const [phnNo, setphnNo] = useState('')

    const fetchSmsApi = async (genOtp) => {
        var response = await postData('sms/sendotp', { otp: genOtp, mobileno: phnNo })
    }

    const handleNextPage = () => {
        var genOtp = parseInt(Math.random() * 8999) + 1000

        Swal.fire({
            icon: 'success',
            position: 'top',
            text: genOtp,
            showConfirmButton: false,
            timer: 2000,
            // toast: true
        })

        // alert(genOtp)
        fetchSmsApi(genOtp)
        navigate('/otp', { state: { phnNo, genOtp } })
    }

    return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>

        <Paper elevation={4} style={{ borderRadius: '30px' }}>


            <div style={{ display: 'flex', width: 350, padding: '20px', flexDirection: 'column', height: 500 }}>
                <div style={{ color: 'blue', fontSize: 'large', cursor: 'pointer' }} onClick={() => navigate('/homepage')}>
                    {<CloseIcon />}
                </div>

                <div style={{ display: 'flex', position: 'relative' }}>
                    <div style={{ fontWeight: 'bold', fontSize: 30, }}>
                        Sign in
                    </div>
                    <div>
                        <img src={logo} style={{ display: 'flex', padding: 5, position: 'absolute', zIndex: 1, width: '18%', marginLeft: '55%', marginTop: '5%' }} />
                    </div>
                </div>

                <div style={{ color: '#535c68' }}>
                    Verify your mobile number to
                    <div>access your <span style={{ fontWeight: 500, color: 'black', cursor: 'pointer' }} onClick={() => navigate('/homepage')}>QuickComm</span> account</div>
                </div>

                <Box sx={{ display: 'flex', alignItems: 'flex-end', marginTop: '5%' }}>
                    <div style={{ marginBottom: 5 }}>+91-</div>
                    <TextField onChange={(e) => setphnNo(e.target.value)} label="Mobile Number" fullWidth variant="standard" />
                </Box>

                {/* <div style={{ marginTop: '10px' }}>
                    <TextField label='Mobile Number' onChange={(e)=>setphnNo(e.target.value)} variant="standard" fullWidth />
                </div> */}

                {phnNo.length == 10 ? <div style={{ marginTop: '50px', }}>
                    <Button variant='contained' style={{ borderRadius: 20 }} onClick={handleNextPage} fullWidth>Continue</Button>
                </div> : <div style={{ marginTop: '50px', }}>
                    <Button variant='contained' style={{ borderRadius: 20, opacity: 0.3 }} fullWidth>Continue</Button>
                </div>}

                <div style={{ marginTop: 15, fontSize: 15, color: 'gray' }}>
                    By continuing, your agree to our <span style={{ color: 'blue', cursor: 'pointer' }}>Terms and Conditions of Use, Privacy</span> and <span style={{ color: "blue", cursor: 'pointer' }}>Retail Account Privacy Policy</span>
                </div>

            </div>
        </Paper>
    </div>)
}