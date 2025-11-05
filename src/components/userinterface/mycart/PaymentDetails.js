import { Button, Divider, TextField, Paper, Grid } from "@mui/material"
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { postData, serverURL } from "../../../services/FetchNodeAdminServices";
import Drawer from "@mui/material/Drawer";
import { useEffect, useState } from "react";
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';
import Swal from "sweetalert2";

export default function PaymentDetails({ refresh, setRefresh }) {

  const [open, setOpen] = useState(false)
  const [pinCode, setPinCode] = useState('')
  const [houseNo, setHouseNo] = useState('')
  const [floorNo, setFloorNo] = useState('')
  const [towerNo, setTowerNo] = useState('')
  const [building, setBuilding] = useState('')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [btnTxt, setBtnTxt] = useState('Place Order')

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cartData = useSelector((state) => state.cart)
  const user = useSelector((state) => state.user)
  const userData = Object.values(user)
  const data = Object.values(cartData)

  const totalamount = data.reduce((f, s) => f + (s.price * s.qty), 0)
  const discount = data.reduce((f, s) => f + (s.offerprice > 0 ? (s.price - s.offerprice) * s.qty : 0), 0)

  const handleClose = (bool) => setOpen(bool)

  const handlePayment = async () => {
    const options = {
      key: "rzp_test_GQ6XaPC6gMPNwH",
      amount: (totalamount - discount) * 100,
      currency: "INR",
      name: "QuickCom",
      description: "Test Transaction",
      image: `${serverURL}/images/logo.png`,
      handler: async (res) => {
        dispatch({ type: 'CLEAR_CART', payload: [] })
        await postData('sms/send_mail', {
          to: userData[0]?.emailaddress,
          subject: 'Your Cart',
          message: '<h1>Bill</h1>'
        })
        navigate("/homepage")
      },
      prefill: {
        name: userData[0]?.fullname,
        email: userData[0]?.emailaddress,
        contact: userData[0]?.mobileno,
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#5B4A76",
      },
    };

    const rzp1 = new window.Razorpay(options);
    await rzp1.open();
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, [])

  const handleSubmitAddress = async () => {
    const body = {
      userid: userData[0]?.userid,
      pincode: pinCode,
      houseno: houseNo,
      floorno: floorNo,
      towerno: towerNo,
      building: building,
      address: address,
      landmark: landmark,
      city: city,
      state: state
    }

    const response = await postData('userinterface/submit_user_address', body)

    if (response.status) {
      const userDataWithAddress = { ...userData[0], ...body }
      dispatch({ type: "ADD_USER", payload: [userData[0]?.userid, userDataWithAddress] })

      Swal.fire({
        icon: 'success',
        text: response.message,
        showConfirmButton: false,
        timer: 2000,
        toast: true
      })

      setBtnTxt('Make Payment')
      setRefresh(!refresh)
      navigate('/cartdisplaypage')
    } else {
      Swal.fire({
        icon: 'error',
        text: response.message,
        showConfirmButton: false,
        timer: 2000,
        toast: true
      })
    }

    setOpen(false)
  }

  const handlePlaceOrder = async () => {
    if (btnTxt === 'Make Payment') {
      handlePayment()
    } else {
      if (userData.length === 0) {
        navigate('/signin')
      } else {
        const response = await postData('userinterface/check_user_address', { userid: userData[0]?.userid })
        if (response.status) {
          const userDataWithAddress = { ...userData[0], ...response.data[0] }
          dispatch({ type: "ADD_USER", payload: [userData[0]?.userid, userDataWithAddress] })
          setBtnTxt('Make Payment')
        } else {
          setOpen(true)
        }
      }
    }
  }

  const addressView = () => (
    <div style={{ padding: 15, overflowY: isMobile ? 'auto' : 'visible', maxHeight: isMobile ? '100vh' : 'unset' }}>
      <Paper style={{ width: '100%', borderRadius: 15 }}>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Add Address</div>
            <CloseIcon style={{ cursor: 'pointer' }} onClick={() => handleClose(false)} />
          </div>
          <div style={{ fontWeight: 900, fontSize: 14, marginTop: 20 }}>Address Details</div>
          <div style={{ display: "flex", marginTop: 10, alignItems: 'center' }}>
            <MyLocationIcon style={{ color: '#5B4A76', marginRight: 5 }} />
            <span style={{ color: '#5B4A76', fontWeight: 500 }}>Use Current Location</span>
          </div>
          <div style={{ marginLeft: 25, fontSize: 12, color: '#777' }}>Using GPS</div>
          <Grid container spacing={1} style={{ marginTop: 10 }}>
            {[['Pin Code', setPinCode], ['House No.', setHouseNo], ['Floor No.', setFloorNo], ['Tower No.', setTowerNo],
            ['Building / Apartment Name', setBuilding], ['Address', setAddress], ['Landmark / Area', setLandmark],
            ['City', setCity], ['State', setState]].map(([label, handler], i) => (
              <Grid item xs={12} key={i}>
                <TextField label={label} onChange={(e) => handler(e.target.value)} variant="standard" fullWidth />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button onClick={handleSubmitAddress} style={{
                borderRadius: 25,
                marginTop: 10,
                color: '#fff',
                background: '#5B4A76',
                fontWeight: 700,
                fontSize: 14
              }} fullWidth>Save and Proceed</Button>
            </Grid>
          </Grid>
        </div>
      </Paper>
    </div>
  )

  const steps = ['Your Cart', 'Review', 'Payment']

  return (
    <div style={{ padding: isMobile ? 10 : 40 }}>
      <Stepper activeStep={0} alternativeLabel style={{ marginBottom: 30 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel><b>{label}</b></StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper style={{
        padding: isMobile ? 20 : 30,
        borderRadius: 20,
        border: '1px solid #e2e2e2',
        marginBottom: 20
      }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 20 }}>Payment Details</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>MRP Total</span>
          <span>&#8377;{totalamount.toFixed(2)}</span>
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00b259' }}>
          <span>Product Discount</span>
          <span>- &#8377;{discount.toFixed(2)}</span>
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Delivery Fee</span>
          <span style={{ color: '#00b259' }}>Free</span>
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Total</span>
          <span>&#8377;{(totalamount - discount).toFixed(2)}</span>
        </div>
        <div style={{ textAlign: 'right', color: '#00b259', fontWeight: 700, marginTop: 5 }}>
          You Saved &#8377;{discount.toFixed(2)}
        </div>
      </Paper>

      <Button
        onClick={handlePlaceOrder}
        style={{
          borderRadius: 25,
          height: 50,
          background: '#5B4A76',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14
        }}
        fullWidth
      >
        {btnTxt}
      </Button>

      <Drawer
        open={open}
        onClose={() => handleClose(false)}
        anchor="right"
        PaperProps={{
          sx: {
            width: matches ? 400 : '100%',
            maxWidth: '100%',
          },
        }}
      >
        {addressView()}
      </Drawer>
    </div>
  )
}
