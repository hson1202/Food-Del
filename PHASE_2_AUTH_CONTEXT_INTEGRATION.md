# Phase 2: AuthContext Integration Guide

## 📋 Tổng quan

File `Frontend/src/Context/AuthContext.jsx` đã được tạo sẵn với đầy đủ chức năng:
- ✅ Verify token với backend khi app load
- ✅ Login/Register functions
- ✅ Logout function
- ✅ Sync token giữa các tabs (storage event)
- ✅ Loading state (`isAuthLoading`)
- ✅ Error handling (`authError`)

## 🚀 Các bước tích hợp vào App

### Bước 1: Wrap App với AuthProvider

**File:** `Frontend/src/App.jsx`

```jsx
import AuthProvider from './Context/AuthContext';
// ... other imports

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <AuthProvider>
      {/* Existing app content */}
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <Navbar setShowLogin={setShowLogin} />
      {/* ... rest of app */}
    </AuthProvider>
  );
};
```

### Bước 2: Tạo FullPageLoader component (optional nhưng recommended)

**File:** `Frontend/src/components/FullPageLoader/FullPageLoader.jsx`

```jsx
import React from 'react';
import './FullPageLoader.css';

const FullPageLoader = () => {
  return (
    <div className="full-page-loader">
      <div className="loader-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default FullPageLoader;
```

**File:** `Frontend/src/components/FullPageLoader/FullPageLoader.css`

```css
.full-page-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loader-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Bước 3: Sử dụng isAuthLoading trong App.jsx

**File:** `Frontend/src/App.jsx`

```jsx
import { useAuth } from './Context/AuthContext';
import FullPageLoader from './components/FullPageLoader/FullPageLoader';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthLoading } = useAuth();

  // Show loader while verifying token
  if (isAuthLoading) {
    return <FullPageLoader />;
  }

  return (
    <>
      {/* Existing app content */}
    </>
  );
};
```

### Bước 4: Update LoginPopup để dùng AuthContext

**File:** `Frontend/src/components/LoginPopup/LoginPopup.jsx`

**Thay đổi:**
- Remove: `const {url,setToken}=useContext(StoreContext)`
- Add: `const { login, register } = useAuth()`
- Update `OnLogin` function để dùng `login()` hoặc `register()` từ context

**Example:**
```jsx
import { useAuth } from '../../Context/AuthContext';

const LoginPopup = ({setShowLogin}) => {
    const { login, register } = useAuth();
    
    const OnLogin = async (event) => {
        event.preventDefault();
        
        let result;
        if (currState === "Login") {
            result = await login(data.email, data.password);
        } else {
            result = await register(data.name, data.email, data.password);
        }
        
        if (result.success) {
            setShowLogin(false);
        } else {
            alert(result.message || "An error occurred");
        }
    };
    
    // ... rest of component
};
```

### Bước 5: Update StoreContext để dùng token từ AuthContext

**File:** `Frontend/src/Context/StoreContext.jsx`

**Thay đổi:**
- Remove: `const [token,setToken]=useState("")`
- Add: `const { token } = useAuth()`
- Remove: Logic verify token trong useEffect (đã có trong AuthContext)
- Update: `loadCartData` chỉ gọi khi có token từ AuthContext

**Example:**
```jsx
import { useAuth } from './AuthContext';

const StoreContextProvider = (props) => {
    const { token } = useAuth(); // Get token from AuthContext
    
    // Remove token state and verification logic
    // Keep only cart and food logic
    
    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            
            // Only load cart if user is authenticated
            if (token) {
                await loadCartData(token);
            }
        }
        loadData();
    }, [token]);
    
    // ... rest of context
};
```

### Bước 6: Update các pages để dùng useAuth()

**Files cần update:**
- `Frontend/src/pages/Navbar/Navbar.jsx`
- `Frontend/src/pages/MyOrders/MyOrders.jsx`
- `Frontend/src/pages/PlaceOrder/PlaceOrder.jsx`
- `Frontend/src/pages/Admin/Admin.jsx`

**Pattern:**
```jsx
// Before
const { token, setToken } = useContext(StoreContext);

// After
const { token, logout, isAuthenticated } = useAuth();
```

**Navbar.jsx example:**
```jsx
import { useAuth } from '../../Context/AuthContext';

const Navbar = ({setShowLogin}) => {
    const { token, logout, isAuthenticated } = useAuth();
    
    const handleLogout = () => {
        logout();
        navigate("/");
        setIsMobileMenuOpen(false);
    };
    
    // Use isAuthenticated instead of !!token
    // ... rest of component
};
```

### Bước 7: Remove localStorage fallbacks

Sau khi tất cả components đã dùng `useAuth()`, remove tất cả:
- `localStorage.getItem("token")` fallbacks
- Direct localStorage access

## ✅ Checklist

- [ ] Wrap App với AuthProvider
- [ ] Tạo FullPageLoader component
- [ ] Add isAuthLoading check trong App.jsx
- [ ] Update LoginPopup để dùng AuthContext
- [ ] Update StoreContext để dùng token từ AuthContext
- [ ] Update Navbar để dùng useAuth()
- [ ] Update MyOrders để dùng useAuth()
- [ ] Update PlaceOrder để dùng useAuth()
- [ ] Update Admin để dùng useAuth()
- [ ] Remove tất cả localStorage fallbacks
- [ ] Test các scenarios:
  - [ ] Login → Reload → Should stay logged in
  - [ ] Token expired → Reload → Should redirect/login
  - [ ] Logout → Reload → Should stay logged out
  - [ ] Login in Tab 1 → Tab 2 should sync

## 🎯 Kết quả mong đợi

Sau khi hoàn thành Phase 2:
- ✅ Single source of truth cho auth state
- ✅ Không còn localStorage fallbacks
- ✅ UX mượt: không flash UI khi reload
- ✅ Code dễ maintain, dễ debug
- ✅ Dễ mở rộng (remember me, roles, refresh token, etc.)

## 📝 Notes

- AuthContext đã handle tất cả logic verify token
- Storage event listener đã được setup để sync giữa tabs
- Error handling đã được tích hợp sẵn
- Loading state đã được quản lý tập trung













