import { Box, Grid, TextField, Button } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

export default function Footer() {
  return (
    <Box component="footer" sx={{ backgroundColor: '#3F2B56', color: '#fff', mt: 8 }}>
      {/* Curved top */}
      <Box sx={{
        height: 50,
        background: '#fff',
        borderBottomLeftRadius: '100% 50%',
        borderBottomRightRadius: '100% 50%',
        marginBottom: '-25px'
      }} />

      <Grid container spacing={4} sx={{ px: 10, pt: 6, pb: 3 }}>
        {/* SHOP */}
        <Grid item xs={12} sm={6} md={2}>
          <Box fontWeight="bold" mb={1}>SHOP</Box>
          <Box>Steel Posters</Box>
          <Box>Mobile Skins</Box>
           <Box>Trendy Products</Box>
          <Box>Gift Cards</Box>
          {/* <Box>Store Locator</Box> */}
          <Box>Refer a Friend</Box>
        </Grid>

        {/* HELP */}
        <Grid item xs={12} sm={6} md={2}>
          <Box fontWeight="bold" mb={1}>HELP</Box>
          <Box>Contact Us</Box>
          <Box>Shipping Policy</Box>
          <Box>FAQ</Box>
        </Grid>

        {/* ABOUT */}
        <Grid item xs={12} sm={6} md={2}>
          <Box fontWeight="bold" mb={1}>ABOUT</Box>
          <Box>Corporate Gifting</Box>
          <Box>Press</Box>
          <Box>Careers</Box>
        </Grid>

        {/* Subscribe Box */}
        <Grid item xs={12} md={6}>
          <Box fontWeight="bold" mb={1}>Sign up to get 10% off your first order</Box>
          <Box display="flex" mt={1}>
            <TextField
              variant="outlined"
              placeholder="Your Email Address"
              sx={{
                color: '#fff',
                input: { color: '#fff' },
                borfdercolor: '#fff',
                borderRadius: '50px',
                mr: 2,
                flexGrow: 1,
              }}
              size="small"
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#F4C542',
                borderRadius: '50px',
                color: '#000',
                fontWeight: 'bold',
                px: 3,
                '&:hover': { backgroundColor: '#e0b93c' }
              }}
            >
              Subscribe
            </Button>
          </Box>

          {/* Social Icons */}
          <Box display="flex" mt={3} gap={2}>
            <InstagramIcon fontSize="medium" />
            <FacebookIcon fontSize="medium" />
            <TwitterIcon fontSize="medium" />
            <LinkedInIcon fontSize="medium" />
          </Box>
        </Grid>
      </Grid>

      {/* Bottom Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        px={10}
        py={2}
        borderTop="1px solid rgba(255, 255, 255, 0.2)"
        fontSize="0.85rem"
      >
        <Box>© 2025 Zeptra, Inc. All Rights Reserved</Box>
        <Box display="flex" gap={3}>
          <Box>Terms of Service</Box>
          <Box>Privacy Policy</Box>
          <Box>Do Not Sell My Information</Box>
        </Box>
      </Box>
    </Box>
  );
}
