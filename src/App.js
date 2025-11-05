import AdminLogin from "./components/admin/adminlogin/AdminLogin";
import Dashboard from "./components/admin/adminlogin/Dashboard";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/userinterface/homepage/HomePage";
import PageCategoryDisplay from "./components/userinterface/pagedisplay/PageCategoryDisplay";
import SignIn from "./components/userinterface/loginpages/SignIn";
import OtpPages from "./components/userinterface/loginpages/OtpPage";
import Detailspage from "./components/userinterface/loginpages/Detailspage";
import ProductDetailPage from "./components/userinterface/productdetailspage/ProductDetailPage";
import CartDisplayPage from './components/userinterface/mycart/CartDisplayPage';
import AuthExample from './components/AuthExample';

function App() {
  return (
    <div style={{ fontFamily: 'Kanit' }}>
      <Router>
        
        <Routes>

          <Route element={<AdminLogin />} path="/adminlogin"></Route>
          <Route element={<Dashboard />} path="/dashboard/*"></Route>
          <Route element={<HomePage />} path="/homepage"></Route>
          <Route element={<PageCategoryDisplay />} path="/pagecategorydisplay"></Route>
          <Route element={<ProductDetailPage />} path="/productdetailpage"></Route>
          <Route element={<CartDisplayPage/>} path="/cartdisplaypage"></Route>
          <Route element={<SignIn />} path="/signin" />
          <Route element={<OtpPages />} path="/otp"></Route>
          <Route element={<Detailspage />} path="/detailspage"></Route>
          <Route element={<AuthExample />} path="/auth-example"></Route>
        </Routes>
      </Router>
    </div>
  );
}


export default App;