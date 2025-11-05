import AdScroll from './AdScroll'
import Footer from './Footer'
import Header from './Header'
import OfferScroll from './OfferScroll'
import ProductScroll from './ProductsScroll'
import { getData, postData } from '../../../services/FetchNodeAdminServices'
import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import VedioAdd from './VedioAdd'

export default function HomePage() {

    const [banners, setBanners] = useState([])
    const [BankOffer, setBankOffer] = useState([])
    const [adOffer, setAdOffer] = useState([])
    const [popularProduct, setPopularProduct] = useState([])
    const [refresh, setRefresh] = useState(false)

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const fetchAllProductDetails = async (productstatus) => {
        var result = await postData('userinterface/display_all_productdetail_by_status', { productstatus })
        setPopularProduct(result.data)
    }

    const fetchAllOffers = async () => {
        var result = await getData('userinterface/show_all_adoffers')
        setAdOffer(result.data)
    }

    const fetchAllBanners = async () => {
        var result = await getData('userinterface/show_all_banner')
        setBanners(result.data)
    }

    const fetchAllBankOffer = async () => {
        var result = await getData('userinterface/show_all_bankoffer')
        setBankOffer(result.data)
    }

    useEffect(function () {
        fetchAllBanners()
        fetchAllBankOffer()
        fetchAllOffers()
        fetchAllProductDetails('Popular')
    }, [])

    return (<div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
        <div>
            <Header />
        </div>

        <div style={{ width: '82%', alignSelf: "center", marginTop: 40 }}>
            <AdScroll data={banners} />
        </div>

        <div style={{ width: '82.6%', alignSelf: "center", marginTop: 35 }}>
            <OfferScroll state={'Offer'} data={adOffer} />
        </div>

        <div style={{ width: '82%', alignSelf: "center", marginTop: 40 }}>
            <ProductScroll refresh={refresh} setRefresh={setRefresh} title={"Popular"} data={popularProduct} />
        </div>

        <div style={{ width: '82%', alignSelf: "center", marginTop: 40 }}>
            <ProductScroll refresh={refresh} setRefresh={setRefresh} title={"Top Brands"} data={popularProduct} />
        </div>
          <div style={{ width: '82.6%', alignSelf: "center", marginTop: 40 }}>
            <OfferScroll state={'Bank'} data={BankOffer} />
        </div>
        <div style={{ width: '82%', alignSelf: "center", marginTop: 40 }}>
            <VedioAdd />
        </div>
        {matches ? <div style={{ width: '100%', alignSelf: "center", marginTop: 20 }}>
            <Footer />
        </div> : <></>}

    </div>)
}