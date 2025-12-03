import React , { useState, useEffect }from 'react'
import Navbar from './pages/Navbar/Navbar';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home'
import Menu from './pages/Menu/Menu'
import AboutUs from './pages/AboutUs/AboutUs'
// import Blog from './pages/Blog/Blog'
// import BlogDetail from './pages/Blog/BlogDetail'
import ContactUs from './pages/ContactUs/ContactUs'
import Reservation from './pages/Reservation/Reservation'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/Footer/Footer';
import LoginPopup from'./components/LoginPopup/LoginPopup';
import MyOrders from './pages/MyOrders/MyOrders'
import TrackOrder from './pages/TrackOrder/TrackOrder'
import Admin from './pages/Admin/Admin'
import FloatingCartBtn from './components/FloatingCartBtn/FloatingCartBtn'
import RequireAuth from './components/RequireAuth/RequireAuth'
import AccountLayout from './pages/Account/AccountLayout'
import ProfilePage from './pages/Account/ProfilePage'
import ChangePasswordPage from './pages/Account/ChangePasswordPage'
import AddressBookPage from './pages/Account/AddressBookPage'
import AccountOrdersPage from './pages/Account/AccountOrdersPage'
import i18n from './i18n';

const App = () => {

  const [showLogin,setShowLogin]=useState(false)

  // Sync HTML language class for font switching (e.g., Montserrat for Vietnamese)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    const handleLanguageChange = (lng) => {
      if (!root || !lng) return;

      // Handle 'vi' and variants like 'vi-VN'
      const isVietnamese = lng === 'vi' || lng.startsWith('vi-');

      if (isVietnamese) {
        root.classList.add('lang-vi');
      } else {
        root.classList.remove('lang-vi');
      }
    };

    // Initialize on first load
    handleLanguageChange(i18n.language || i18n.resolvedLanguage);

    // Listen to language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <Navbar setShowLogin={setShowLogin}/>  
    <div className='app'>
      <Routes>
        <Route path='/' element={<Menu/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/menu' element={<Menu/>}/>
        <Route path='/about' element={<AboutUs/>}/>
        {/* <Route path='/blog' element={<Blog/>}/> */}
        {/* <Route path='/blog/:slug' element={<BlogDetail/>}/> */}
        <Route path='/contact' element={<ContactUs/>}/>
        <Route path='/reservation' element={<Reservation/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/order' element={<PlaceOrder/>}/>
        <Route path='/myorders' element={<MyOrders />} />
        <Route path='/track-order' element={<TrackOrder />} />
        <Route path='/admin' element={<Admin />} />
        
        {/* Account routes - protected */}
        <Route 
          path='/account' 
          element={
            <RequireAuth setShowLogin={setShowLogin}>
              <AccountLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/account/profile" replace />} />
          <Route path='profile' element={<ProfilePage />} />
          <Route path='password' element={<ChangePasswordPage />} />
          <Route path='addresses' element={<AddressBookPage />} />
          <Route path='orders' element={<AccountOrdersPage />} />
        </Route>

      </Routes>
    </div>
    <Footer/>
    <FloatingCartBtn />
    </>
  )
}

export default App;