import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { serverURL } from "../../../services/FetchNodeAdminServices";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import PlusMinusButton from "./PlusMinusButton";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function ProductScroll({ title, data, refresh, setRefresh }) {
  const dispatch = useDispatch();
  const scrollRef = useRef();
  const navigate = useNavigate();
  const [overState, setOverState] = useState(false);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"));
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const cartData = useSelector((state) => state?.cart || {});
  const cartKeys = Object.keys(cartData);

  const settings = {
    dots: false,
    speed: 800,
    slidesToShow: mdUp ? 6 : smUp ? 3 : 2,
    slidesToScroll: 1,
    arrows: false,
    cssEase: "ease-in-out",
    swipeToSlide: true,
    touchThreshold: 100,
  };

  const handleChange = (value, item) => {
    if (value === 0) {
      dispatch({ type: "DELETE_CART", payload: [item.productdetailid] });
    } else {
      item.qty = value;
      dispatch({ type: "ADD_CART", payload: [item.productdetailid, item] });
    }
    setRefresh(!refresh);
  };

  const handleNavigateProductDetail = (item) => {
    navigate("/productdetailpage", { state: { product: item } });
  };

  const showImages = () => {
    return data.map((item) => {
      const discount = parseInt(((item.price - item.offerprice) / item.price) * 100);
      const quantity = cartKeys.includes(item.productdetailid) ? cartData[item.productdetailid]?.qty : 0;

      return (
        <div
          key={item.productdetailid}
          style={{
            padding: 8,
            display: "flex",
            flexDirection: "column",
            transition: "transform 0.3s ease",
          }}
        >
          <div
            onClick={() => handleNavigateProductDetail(item)}
            style={{
              alignSelf: "center",
              height: smUp ? 180 : 100,
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: 10,
              transition: "transform 0.3s ease",
            }}
          >
            <img
              src={`${serverURL}/images/${item.picture}`}
              alt={item.productdetailname}
              style={{
                width: mdUp ? "80%" : smUp ? "60%" : "70%",
                borderRadius: 10,
                transition: "transform 0.3s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>

          <div style={{ height: 120, paddingTop: 6 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#333",
                width: "90%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: smUp ? "2" : "1",
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.productdetailname}
            </div>

            <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
              {item.weight} {item.weightType}
            </div>

            {item.offerprice > 0 ? (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#5B4778" }}>
                  ₹{item.offerprice}
                </div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 13, marginTop: 2 }}>
                  <s style={{ color: "#999" }}>₹{item.price}</s>
                  <span
                    style={{
                      marginLeft: 8,
                      padding: "2px 6px",
                      background: "#e5f7ee",
                      color: "#03753c",
                      fontSize: 12,
                      borderRadius: 4,
                    }}
                  >
                    {discount}% OFF
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 6, fontSize: 15, fontWeight: 600 }}>
                ₹{item.price}
              </div>
            )}
          </div>

          <div>
            <PlusMinusButton qty={quantity} onChange={(value) => handleChange(value, item)} />
          </div>
        </div>
      );
    });
  };

  const handleNext = () => scrollRef.current?.slickNext();
  const handlePrev = () => scrollRef.current?.slickPrev();

  return (
    <div>
      <div
        style={{
          fontWeight: 900,
          fontSize: 24,
          textTransform: "capitalize",
          color: "#5B4778",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div
        style={{ position: "relative", padding: "8px 0" }}
        onMouseEnter={() => setOverState(true)}
        onMouseLeave={() => setOverState(false)}
      >
        {overState && smUp && (
          <div onClick={handlePrev} style={arrowStyle("left")}>
            <KeyboardArrowLeftIcon style={{ color: "#fff", fontSize: 20 }} />
          </div>
        )}

        <Slider ref={scrollRef} {...settings}>
          {showImages()}
        </Slider>

        {overState && smUp && (
          <div onClick={handleNext} style={arrowStyle("right")}>
            <KeyboardArrowRightIcon style={{ color: "#fff", fontSize: 20 }} />
          </div>
        )}
      </div>
    </div>
  );
}

const arrowStyle = (position) => ({
  position: "absolute",
  top: "40%",
  [position]: position === "left" ? "1%" : "1.5%",
  zIndex: 2,
  background: "#5B4778",
  opacity: 0.8,
  width: 36,
  height: 36,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  transition: "opacity 0.3s ease, transform 0.3s ease",
});
