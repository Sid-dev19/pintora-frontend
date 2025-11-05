import * as React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { serverURL } from "../../../services/FetchNodeAdminServices";
import PlusMinusButton from "../homepage/PlusMinusButton";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector, useDispatch } from 'react-redux';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router-dom';

const Accordion = styled((props) => (
  <MuiAccordion elevation={0} square {...props} />
))(({ theme }) => ({
  border: `0px solid `,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.5rem', color: '#0652DD' }} />}
    {...props}
  />
))(({ theme }) => ({

  flexDirection: 'col-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(0),
  },
  ...theme.applyStyles('white', {
    backgroundColor: 'inherit',
  }),
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0),
  borderBottom: '0px solid #e0e0e0',
}));


export default function ProductDetailsCategory({ productData, refresh, setRefresh }) {

  var navigate = useNavigate()
  var cartData = useSelector((state) => state?.cart)
  var keys = Object.keys(cartData)

  var dispatch = useDispatch()

  const [expanded, setExpanded] = React.useState('');

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);

  };

  const handleChangeQty = (value, item) => {

    if (value == 0) {
      dispatch({ type: 'DELETE_CART', payload: [item.productdetailid] })
    }
    else {
      item['qty'] = value
      dispatch({ type: 'ADD_CART', payload: [item.productdetailid, item] })
    }

    setRefresh(!refresh)
  }

  const showImages = () => {
    // Check if productData is available and is an array
    if (!productData || !Array.isArray(productData)) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography>No product data available</Typography>
        </Box>
      );
    }

    return productData.map((item, index) => {
      if (!item) return null; // Skip if item is undefined

      const op = item.price > 0 ? parseInt(((item.price - (item.offerprice || item.price)) / item.price) * 100) : 0;

      return (
        <div key={item.id || index} style={{
          alignItems: 'center',
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          width: '20%',
          marginLeft: 20,
          border: '1px solid #e0e0e0',
          borderRadius: 10
        }}>
          <div style={{ marginLeft: 10, width: '100%', display: 'flex' }}>
            <img
              src={item.picture ? `${serverURL}/images/${item.picture}` : '/default-product.png'}
              alt={item.name || 'Product'}
              style={{ width: 150, height: 150, objectFit: 'contain', borderRadius: 20 }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-product.png';
              }}
            />
            <span style={{ marginLeft: 'auto' }}><FavoriteBorderIcon /></span>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            {item.price > 0 && (
              <div>
                <img src={`${serverURL}/images/smart-bazaar-tag.svg`} alt="Smart Bazaar" width="80" />
              </div>
            )}

            <div style={{
              marginTop: 15,
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: -0.07,
              lineHeight: 1.4285714286,
              width: '75%',
              overflow: "hidden",
              textOverflow: 'ellipsis',
              display: "-webkit-box",
              webkitLineClamp: "2",
              webkitBoxOrient: "vertical",
            }}>

              {item.productdetailname}
            </div>
            {item.productdetailname.length <= 24 ? <div style={{ lineHeight: 1.2456, }}>&nbsp;</div> : <></>}

            <div style={{
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: -0.07,
              lineHeight: 1.4285714286,
            }}>

              {item.weight} {item.weightType}
            </div>
            {item.offerprice > 0 ? <div style={{ marginTop: 7, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: -0.07,
                lineHeight: 1.4285714286,
              }}>

                <span>&#8377;</span> {item.offerprice}
              </div>

              <div style={{
                fontWeight: 500,
                fontSize: 14,
                letterSpacing: -0.07,
                lineHeight: 1.4285714286,
                color: 'grey'
              }}>

                <div style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}><s><span>&#8377;{item.price}</span></s><span style={{ margin: 5, width: 55, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 2, background: '#e5f7ee', color: '#03753c' }}>{op}% OFF</span></div>
              </div>

            </div> : <div>
              <div style={{
                marginTop: 7,
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: -0.07,
                lineHeight: 1.4285714286,

              }}>

                <span>&#8377;</span> {item.price}
              </div>
              <div style={{ lineHeight: 1.6285714286, }}>&nbsp;</div>
            </div>
            }
          </div>
          <div>
            <PlusMinusButton qty={keys.includes(item?.productdetailid + '') ? cartData[item?.productdetailid]?.qty : 0} onChange={(value) => handleChangeQty(value, item)} />
          </div>
        </div>
      )
    })
  }

  return (<div>

    <div style={{ display: 'flex', flexDirection: 'column' }}>

      <Box sx={{ marginTop: 5, marginLeft: 96, display: 'flex', flexWrap: 'wrap', '& > :not(style)': { m: 1, width: 180, height: 15 } }}>
        <section elevation={3} style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: 10, borderRadius: 24, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', fontSize: 15 }}>

            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}  >
              <AccordionSummary aria-controls="panel1d-content" id="panel1d-header" style={{ display: 'flex', alignItems: 'center', flexGrow: 1, width: 200 }} >
                <Typography><span style={{ fontWeight: 500, fontSize: 14, letterSpacing: -0.07, lineHeight: 1.4285714286 }}>Sort by:</span><span style={{ marginLeft: 3, fontWeight: 700, fontSize: 15, letterSpacing: -0.07, lineHeight: 1.4285714286 }}>Popularity</span></Typography>
              </AccordionSummary>
              <AccordionDetails>
              </AccordionDetails>
            </Accordion>

          </div>
        </section>
      </Box>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column' }}>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {showImages()}
      </div>
    </div>
  </div>)
}