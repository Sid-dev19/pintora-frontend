import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { serverURL } from "../../../services/FetchNodeAdminServices";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useRef, useState } from "react";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function OfferScroll({ state, data }) {

    const [overState, setOverState] = useState(false)

    var scrollRef = useRef()

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    var settings = {
        dots: false,
        infinite: true,
        speed: 2500,
        slidesToShow: matches ? 3 : 2,
        slidesToScroll: 1,
        arrows: false,
        autoplay:'true'

    };



    const showImages = () => {
        return data.map((item) => {
            return <div>
                <img src={`${serverURL}/images/${item.filenames}`} style={{ width: '97%', borderRadius: 10 }} />
            </div>
        })
    }

    const handleNext = () => {
        scrollRef.current.slickNext()
    }

    const handlePrev = () => {
        scrollRef.current.slickPrev()
    }

    return (<div style={{ position: 'relative' }} onMouseLeave={() => setOverState(false)} onMouseOver={() => setOverState(true)}>

        {overState ? matches ? <div onClick={handleNext} style={{ position: 'absolute', zIndex: 2, top: '43% ', left: '0.8%', opacity: 0.5, background: '#b2bec3', width: 30, height: 30, display: 'flex', alignItems: "center", justifyContent: 'center', borderRadius: 15 }}>
            <KeyboardArrowLeftIcon style={{ color: '#fff' }} />
        </div> : <div></div> : ""}

        <Slider ref={scrollRef} {...settings}>
            {showImages()}
        </Slider>

        {overState ? matches ? <div onClick={handlePrev} style={{ position: 'absolute', zIndex: 2, top: '43% ', right: '2.8%', opacity: 0.5, background: '#b2bec3', width: 30, height: 30, display: 'flex', alignItems: "center", justifyContent: 'center', borderRadius: 15 }}>
            <KeyboardArrowRightIcon style={{ color: '#fff' }} />
        </div> : <div></div> : ""}
    </div>)
}