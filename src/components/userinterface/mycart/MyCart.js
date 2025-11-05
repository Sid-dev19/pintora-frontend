import { serverURL } from "../../../services/FetchNodeAdminServices";
import CartButton from "./CartButton";
import { Divider, Typography, Box, useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import PlusMinusButton from "../homepage/PlusMinusButton";

export default function MyCart({ refresh, setRefresh }) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.cart);
  const data = Object.values(cartData);
  const user = useSelector((state) => state.user);
  const userData = Object.values(user);
  const keys = Object.keys(cartData);

  const totalamount = data.reduce((sum, item) => {
    const price = item.offerprice > 0 ? item.offerprice : item.price;
    return sum + price * item.qty;
  }, 0);

  const handleChange = (value, item) => {
    if (value === 0) {
      dispatch({ type: "DELETE_CART", payload: [item.productdetailid] });
    } else {
      item.qty = value;
      dispatch({ type: "ADD_CART", payload: [item.productdetailid, item] });
    }
    setRefresh(!refresh);
  };

  const showAddress = () => {
    const u = userData[0];
    return (
      <Box sx={{ mt: 4, ml: matches ? 10 : 2, border: '1px solid #e2e2e2', borderRadius: 2, p: 3, width: matches ? '30%' : '90%' }}>
        <Typography fontWeight="bold" fontSize={18}>Delivery Address</Typography>
        <Typography fontWeight={500}>{u.firstname} {u.lastname}</Typography>
        <Typography>{u.address}</Typography>
        <Typography>{u.building}, {u.towerno}, {u.floorno}</Typography>
        <Typography>House No: {u.houseno}</Typography>
        <Typography>{u.state}, {u.city}, {u.pincode}</Typography>
      </Box>
    );
  };

  const CartDetails = () => {
    return data.map((item, index) => {
      const price = item.offerprice > 0 ? item.offerprice : item.price;
      const totalPrice = price * item.qty;
      const originalPrice = item.price * item.qty;
      const savings = (item.price - item.offerprice) * item.qty;

      return (
        <Box key={index} sx={{ px: matches ? 5 : 2, py: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: matches ? 'row' : 'column' }}>
            <Box sx={{ width: matches ? 120 : '100%', textAlign: 'center' }}>
              <img src={`${serverURL}/images/${item.picture}`} style={{ width: matches ? 80 : 100 }} alt="product" />
              {/* <Typography variant="caption" sx={{ color: 'green', mt: 1 }}>Delivery by 10th Aug</Typography> */}
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Typography fontWeight={600}>{item.productdetailname}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography fontWeight={700} fontSize={16} color="#141414">
                  ₹{totalPrice.toLocaleString()}
                </Typography>
                {item.offerprice > 0 && (
                  <Typography sx={{ ml: 1, color: '#b5b5b5', fontSize: 14 }}>
                    <s>₹{originalPrice.toLocaleString()}</s>
                  </Typography>
                )}
              </Box>

              {item.offerprice > 0 && (
                <Box sx={{ backgroundColor: '#e5f7ee', color: '#03753c', fontSize: 12, fontWeight: 700, px: 1, py: 0.5, borderRadius: 1, mt: 1, display: 'inline-block' }}>
                  You Save ₹{savings}
                </Box>
              )}

              <Typography sx={{ mt: 1, fontSize: 12, color: '#777' }}>
                Sold by: <span style={{ color: '#141414' }}>zeptra Retail</span>
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#777' }}>
                Size: <span style={{ color: '#141414' }}>{item.weight} {item.weighttype}</span>
              </Typography>
            </Box>

            <Box sx={{ alignSelf: 'center', ml: matches ? 'auto' : 0 }}>
              <PlusMinusButton
                qty={keys.includes(item.productdetailid + '') ? cartData[item.productdetailid]?.qty : 0}
                onChange={(value) => handleChange(value, item)}
              />
            </Box>
          </Box>

          {index < data.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      );
    });
  };

  return (
    <Box sx={{ px: 2 }}>
      {userData?.length > 0 && showAddress()}

      <Typography sx={{ mt: 5, ml: matches ? 10 : 2, fontWeight: 900, fontSize: 24 }}>
        My Cart
      </Typography>

      <Box sx={{ mt: 3, mx: matches ? '10%' : '2%', border: '1px solid #e2e2e2', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3, alignItems: 'center' }}>
          <Typography fontWeight={900}>Scheduled Delivery Basket</Typography>
          <Typography fontWeight={900} fontSize={16} color="#141414">₹{totalamount.toLocaleString()}</Typography>
        </Box>

        <Divider />
        {CartDetails()}
      </Box>
    </Box>
  );
}
