import { Paper, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { LoadingButton } from "@mui/lab";
import { MuiOtpInput } from "mui-one-time-password-input";
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import { useLocation, useNavigate } from "react-router-dom";
import { postData } from "../../../services/FetchNodeAdminServices";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function Otppage() {

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const mobileno = location?.state?.phnNo
    const genOtp = location?.state?.genOtp

    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false);

    const handleChange = (newValue) => {
        setOtp(newValue)
    }

    const handleVerify = async () => {
        if (!otp) {
            Swal.fire({
                icon: 'error',
                text: 'Please enter the OTP',
                showConfirmButton: false,
                timer: 2000,
            });
            return;
        }

        if (otp !== genOtp) {
            Swal.fire({
                icon: 'error',
                text: 'Invalid OTP. Please try again.',
                showConfirmButton: false,
                timer: 2000,
            });
            return;
        }

        setLoading(true);
        try {
            // Check if user exists
            const response = await postData('userinterface/check_user_mobileno', { mobileno });
            
            if (response?.status) {
                // User exists, update user data
                dispatch({ type: "ADD_USER", payload: [response.data.userid, response.data] });

                // Fetch user address if available
                try {
                    const res = await postData('userinterface/check_user_address', { 
                        userid: response.data.userid 
                    });

                    if (res?.status && res.data?.[0]) {
                        const userDataWithAddress = { ...response.data, ...res.data[0] };
                        dispatch({ 
                            type: "ADD_USER", 
                            payload: [response.data.userid, userDataWithAddress] 
                        });
                    }

                    navigate('/cartdisplaypage');
                } catch (error) {
                    console.error('Error fetching user address:', error);
                    // Continue to cart even if address fetch fails
                    navigate('/cartdisplaypage');
                }
            } else {
                // New user, navigate to details page
                navigate('/detailspage', { 
                    state: { 
                        mobileno,
                        // Include any other necessary data for registration
                    } 
                });
            }
        } catch (error) {
            console.error('Error during OTP verification:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to verify OTP. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    return (

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <Paper elevation={3} style={{ borderRadius: 24 }}>
                <div style={{ padding: 24, border: '1px solid #fff', borderRadius: 24, width: 354, height: 500, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>

                        <div onClick={() => navigate('/signin')} style={{ marginBottom: 15 }}>
                            {<ArrowBackIosNewOutlinedIcon />}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '70%' }}>
                                <div style={{
                                    fontWeight: 900,
                                    textTransform: 'none',
                                    fontSize: 24,
                                    letterSpacing: -.72,
                                    lineHeight: 1.1666666667, marginBottom: 4
                                }}>
                                    OTP verification

                                </div>
                                <div style={{
                                    fontWeight: 550,
                                    textTransform: 'none',
                                    fontSize: 16,
                                    letterSpacing: -.08,
                                    lineHeight: 1.5, color: 'rgba(0,0,0,.65)'
                                }}>
                                    Enter the OTP sent to you on +91-{mobileno} <span style={{ color: '#0a2885', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/signin')}>Change number</span>
                                </div>

                            </div>

                        </div>
                        <div style={{ height: 187, display: 'flex', flexDirection: 'column', marginTop: 5, justifyContent: 'space-between', marginBottom: 25 }}>
                            <MuiOtpInput value={otp} onChange={handleChange} />
                            <LoadingButton
                                fullWidth
                                variant="contained"
                                onClick={handleVerify}
                                loading={loading}
                                loadingPosition="start"
                                startIcon={!loading && <CheckCircleOutlineIcon />}
                                sx={{
                                    height: 50,
                                    borderRadius: '25px',
                                    backgroundColor: '#0f3cc9',
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#0d33a6',
                                    },
                                    '&.MuiLoadingButton-loading': {
                                        backgroundColor: '#0f3cc9',
                                    },
                                    '& .MuiLoadingButton-loadingIndicator': {
                                        color: '#fff',
                                    },
                                }}
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </LoadingButton>
                        </div>
                        <div style={{ marginTop: 15, fontSize: 15, color: 'gray' }}>
                            By continuing, your agree to our <span style={{ color: 'blue', cursor: 'pointer' }}>Terms and Conditions of Use, Privacy</span> and <span style={{ color: "blue", cursor: 'pointer' }}>Retail Account Privacy Policy</span>
                        </div>

                    </div>

                </div>
            </Paper>
        </div>
    )
}