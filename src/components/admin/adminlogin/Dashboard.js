import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Button, Grid } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Paper } from '@mui/material';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { serverURL } from '../../../services/FetchNodeAdminServices';
import Category from '../category/Category'
import DisplayAllCategory from '../category/DisplayAllCategory'
import SubCategory from '../subcategory/SubCategory'
import DisplayAllSubCategory from '../subcategory/DisplayAllSubCategory';
import Brand from '../brands/Brand'
import DisplayAllBrand from '../brands/DisplayAllBrand';
import Product from '../products/Product'
import DisplayAllProduct from '../products/DisplayAllProduct';
import ProductDetails from '../productdetails/ProductDetails'
import DisplayAllProductDetail from '../productdetails/DisplayAllProductDetail';
import ProductPictures from '../productpictures/ProductPictures'
import Mainbanner from '../mainbanner/Mainbanner'
import Adoffers from '../adoffers/Adoffers'
import BankAndOtherOffer from '../bankandotheroffers/BankAndOtherOffers'

export default function Dashboard() {

  var navigate = useNavigate()

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            QuickComm
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>

      <Grid container>
        <Grid item xs={2}>
          <Paper elevation={3} style={{ flexDirection: 'column', display: 'flex', alignItems: 'center', height: 600, margin: 10 }}>

            <div >
              <img src={`${serverURL}/images/1.jpg`} style={{ width: 70, height: 70, borderRadius: 35, marginTop: 10 }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>
              Harry Singh
            </div>
            <div style={{ fontSize: 10, fontWeight: 'bold', color: 'grey' }}>
              harrysingh@gmail.com
            </div>

            <Divider style={{ width: '90%', marginTop: 10 }} />
            <div>
              <List>

                <ListItem>
                  <ListItemButton >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/dashboard.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Dashboard
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>

                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton onClick={() => navigate('/dashboard/displayallcategory')}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/category.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Category
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>


                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton onClick={() => navigate('/dashboard/displayallsubcategory')}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/Subcategory.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Sub-Category
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>


                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton onClick={() => navigate('/dashboard/displayallbrand')}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/brand-image.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Brand
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>


                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton onClick={() => navigate('/dashboard/displayallproduct')}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/products.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Products
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>


                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton onClick={() => navigate('/dashboard/displayallproductdetail')}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/product-catalog.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Product Details
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>


                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton onClick={() => navigate('/dashboard/productpictures')}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/product-image.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Product Image
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>


                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton onClick={() => navigate('/dashboard/mainbanner')}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/ribbon-folds.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Banners
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>


                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton onClick={() => navigate('/dashboard/adoffers')}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/adimages.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Products Ad
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>


                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton onClick={() => navigate('/dashboard/bankandotheroffer')}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/bank-account.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Bank Offers
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>


                <ListItem style={{ marginTop: -25 }}>
                  <ListItemButton >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src='/check-out.png' style={{ width: 30, height: 30 }} />
                      <div style={{ fontWeight: 600, marginLeft: 15 }}>
                        Logout
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>

              </List>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={10}>

          <Routes>

            <Route element={<Category />} path='/category'></Route>
            <Route element={<DisplayAllCategory />} path='/displayallcategory'></Route>
            <Route element={<SubCategory />} path='/subcategory'></Route>
            <Route element={<DisplayAllSubCategory />} path='/displayallsubcategory'></Route>
            <Route element={<Brand />} path="/brand"></Route>
            <Route element={<DisplayAllBrand />} path="/displayallbrand"></Route>
            <Route element={<Product />} path="/product"></Route>
            <Route element={<DisplayAllProduct />} path="/displayallproduct"></Route>
            <Route element={<ProductDetails />} path="/productdetails"></Route>
            <Route element={<DisplayAllProductDetail />} path="/displayallproductdetail"></Route>
            <Route element={<ProductPictures />} path="/productpictures"></Route>
            <Route element={<Mainbanner />} path="/mainbanner"></Route>
            <Route element={<Adoffers />} path="/adoffers"></Route>
            <Route element={<BankAndOtherOffer />} path="/bankandotheroffer"></Route>

          </Routes>

        </Grid>

      </Grid>
    </div>
  )
}