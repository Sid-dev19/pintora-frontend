import * as React from 'react';
import { useState, useEffect } from 'react';
import { serverURL, postData } from "../../../services/FetchNodeAdminServices";
import AddToCart from './AddToCart';
import { Paper } from '@mui/material';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useRef } from "react";
import PlusMinusButton from '../homepage/PlusMinusButton';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';

export default function ProductImageComponent({ product, setProduct, refresh, setRefresh }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  var cartData = useSelector((state) => state?.cart)
  var keys = Object.keys(cartData || {})
  const [index, setIndex] = useState(0)

  var scrollRef = useRef()
  var settings = {
    dots: false,
    infinite: true,
    spaceBetween: 24,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    vertical: true,
    verticalSwiping: true,
    beforeChange: (current, next) => setIndex(next)
  };

  const [productImages, setProductImages] = useState([product?.picture].filter(Boolean))
  const [selectedImage, setSelectedImage] = useState(product?.picture || '')

  const fetchAllImages = async () => {
    try {
      if (!product?.productdetailid) {
        console.warn('No product detail ID available');
        return;
      }

      const response = await postData('userinterface/user_display_product_picture', { 
        productdetailid: product.productdetailid 
      });

      console.log('Image API Response:', response);

      // Handle different response formats
      if (response?.data?.[0]?.filenames) {
        // If filenames is a string, split it
        const filenames = response.data[0].filenames;
        if (typeof filenames === 'string') {
          setProductImages(filenames.split(',').map(f => f.trim()).filter(Boolean));
        } else if (Array.isArray(filenames)) {
          setProductImages(filenames);
        }
      } else if (Array.isArray(response?.data)) {
        // If data is an array of objects with filename property
        const images = response.data
          .map(item => item.filename || item.picture || '')
          .filter(Boolean);
        setProductImages(images);
      } else {
        console.warn('Unexpected response format:', response);
        // Fallback to using the main product image
        if (product?.picture) {
          setProductImages([product.picture]);
          setSelectedImage(product.picture);
        }
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
      // Fallback to using the main product image
      if (product?.picture) {
        setProductImages([product.picture]);
        setSelectedImage(product.picture);
      }
    }
  };

  useEffect(() => {
    if (product?.picture) {
      setSelectedImage(product.picture);
      setProductImages(prev => {
        // Only update if we don't have images yet
        return prev.length > 0 ? prev : [product.picture];
      });
    }
    fetchAllImages();
  }, [product]);

  const handleImage = (item) => {
    setSelectedImage(item);
  }

  const showImage = () => {
    if (!productImages || productImages.length === 0) {
      return (
        <div>
          <img 
            src={product?.picture ? `${serverURL}/images/${product.picture}` : '/placeholder.jpg'} 
            style={{ 
              width: '60%', 
              borderRadius: 20, 
              border: '1px solid #e0e0e0', 
              padding: 6 
            }} 
            alt="Product" 
          />
        </div>
      );
    }

    return productImages.map((item, i) => (
      <div key={i}>
        <img 
          onClick={() => handleImage(item)} 
          src={`${serverURL}/images/${item}`} 
          style={{ 
            width: '60%', 
            borderRadius: 20, 
            border: selectedImage === item ? '2px solid #3f51b5' : '1px solid #e0e0e0', 
            padding: 6, 
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} 
          alt={`Product view ${i + 1}`}
        />
      </div>
    ));
  }

  // Rest of your component...
  return (
    <div style={{ display: 'flex', flexDirection: 'row', padding: 20 }}>
      {/* Thumbnail Images */}
      <div style={{ width: '15%', marginRight: 20 }}>
        <Slider {...settings} ref={scrollRef}>
          {showImage()}
        </Slider>
      </div>

      {/* Main Image */}
      <div style={{ width: '80%', display: 'flex', justifyContent: 'center' }}>
        <img
          src={selectedImage ? `${serverURL}/images/${selectedImage}` : '/placeholder.jpg'}
          style={{
            maxWidth: '100%',
            maxHeight: '500px',
            objectFit: 'contain',
            borderRadius: 8
          }}
          alt="Product"
        />
      </div>
    </div>
  );
}