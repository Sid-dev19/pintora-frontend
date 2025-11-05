import { useEffect, useState } from 'react'
import Footer from '../homepage/Footer'
import Header from '../homepage/Header'
import ProductDetailsCategory from '../pagedisplay/ProductDetailsCategory'
import { postData, getData } from '../../../services/FetchNodeAdminServices'
import ShowSubCategory from './ShowSubCategory'
import { useLocation, useNavigate } from 'react-router-dom'

export default function PageCategoryDisplay() {

 
  var location = useLocation()
  var productData = location?.state?.productData

  const [subCategory, setSubCategory] = useState([])
  const [refresh, setRefresh] = useState(false)


  const fetchAllSubCategory = async () => {
    var result = await getData('userinterface/user_display_all_subcategory')
    setSubCategory(result.data)
  }
  useEffect(() => {
    fetchAllSubCategory()
  }, [])


  return (<div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>

    <div>
      <Header />
    </div>

    <div style={{ marginTop: 50, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#fff' }}>
      <span style={{ display: 'flex', backgroundColor: '#fff' }}>
        <ShowSubCategory data={subCategory} scid={productData[0]?.subcategoryid} />
        <ProductDetailsCategory  refresh={refresh} setRefresh={setRefresh} productData={productData} />
      </span>
    </div>

    <div>
      <Footer />
    </div>

  </div>)
}  