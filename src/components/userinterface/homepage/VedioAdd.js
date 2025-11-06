import React, { useEffect, useState } from 'react';
import ProductVid from "../../../assets/product.mp4";

// sedrftghjk

export default function VedioAdd() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '20px',
      padding: isMobile ? '20px' : '40px',
      backgroundColor: '#E5DDF5',
      borderRadius: '20px',
      justifyContent: 'center',
      alignItems: 'stretch',
      flexWrap: 'wrap',
    },
    descriptionSection: {
      backgroundColor: '#5B4A76',
      color: 'white',
      padding: isMobile ? '20px' : '40px',
      borderRadius: '20px',
      flex: '1 1 400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      textAlign: isMobile ? 'center' : 'left',
    },
    brandTag: {
      fontSize: '14px',
      letterSpacing: '1px',
      opacity: 0.6,
    },
    mainHeading: {
      fontSize: isMobile ? '28px' : '36px',
      fontWeight: 'bold',
      margin: '20px 0',
    },
    description: {
      fontSize: isMobile ? '16px' : '18px',
      lineHeight: 1.6,
      marginBottom: '30px',
    },
    shopButton: {
      backgroundColor: 'white',
      color: 'black',
      fontWeight: 'bold',
      padding: '14px 32px',
      borderRadius: '999px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      width: isMobile ? '100%' : 'fit-content',
      alignSelf: isMobile ? 'center' : 'flex-start',
    },
    videoSection: {
      position: 'relative',
      flex: '1 1 400px',
      borderRadius: '20px',
      overflow: 'hidden',
      height: isMobile ? '250px' : 'auto',
    },
    productVideo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.descriptionSection}>
        <p style={styles.brandTag}>ZEPtra - Design That Speaks. Vibes That Stick</p>
        <h1 style={styles.mainHeading}>Glossy. Magnetic. Built to Last</h1>
        <p style={styles.description}>
          Stick it up in seconds—no nails, no mess. Our metal posters shine with rich colors and stay flawless for years,
          thanks to a scratch-resistant, fade-proof finish. Just snap, style, and enjoy the vibe.
        </p>
        <button style={styles.shopButton}>Shop Now</button>
      </div>

      <div style={styles.videoSection}>
        <video
          style={styles.productVideo}
          src={ProductVid}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </div>
  );
}
