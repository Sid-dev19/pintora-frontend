import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { serverURL } from "../../../services/FetchNodeAdminServices";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function AdScroll({ data }) {
    const scrollRef = useRef();
    const [overState, setOverState] = useState(false);
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    const settings = {
        dots: false,
        infinite: true,
        speed: 5000,               // VERY slow slide transition (5s)
        autoplaySpeed: 10000,      // wait 10s before next slide
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        cssEase: "cubic-bezier(0.77, 0, 0.175, 1)" // very smooth easing
    };

    const handleNext = () => scrollRef.current?.slickNext();
    const handlePrev = () => scrollRef.current?.slickPrev();

    const showImages = () => {
        return data.map((item, index) => (
            <div key={index}>
                <div style={imageContainerStyle}>
                    <img
                        src={`${serverURL}/images/${item.filenames}`}
                        alt={`ad-${index}`}
                        style={imageStyle}
                    />
                </div>
            </div>
        ));
    };

    return (
        <div
            style={mainContainerStyle}
            onMouseEnter={() => setOverState(true)}
            onMouseLeave={() => setOverState(false)}
        >
            {overState && matches && (
                <div onClick={handlePrev} style={arrowStyle('left')}>
                    <KeyboardArrowLeftIcon style={{ color: '#fff' }} />
                </div>
            )}

            <Slider ref={scrollRef} {...settings}>
                {showImages()}
            </Slider>

            {overState && matches && (
                <div onClick={handleNext} style={arrowStyle('right')}>
                    <KeyboardArrowRightIcon style={{ color: '#fff' }} />
                </div>
            )}
        </div>
    );
}

// Style definitions

const mainContainerStyle = {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
};

const imageContainerStyle = {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
};

const imageStyle = {
    width: '100%',
    height: 'auto',
    display: 'block',
    transition: 'transform 5s ease-in-out',
};

const arrowStyle = (side) => ({
    position: 'absolute',
    top: '45%',
    [side]: '1%',
    zIndex: 2,
    opacity: 0.6,
    background: '#636e72',
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease'
});
