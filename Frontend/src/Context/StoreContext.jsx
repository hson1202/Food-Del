import { createContext,useEffect,useState } from "react";
import axios from "axios"
import config from "../config/config"


export const StoreContext= createContext(null)

const StoreContextProvider =(props)=>{

    
    const [cartItems,setCartItems] = useState({});  
    const url = config.BACKEND_URL
    const [token,setToken]=useState("")
    const [food_list,setFoodList]=useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const addToCart =async (itemId) =>{  
        if (!cartItems[itemId]) {  
            setCartItems((prev)=>({...prev,[itemId]:1}))  
        }  
        else {  
            setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))  
        } 
        if (token){
            await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
        }
    }  
  
    const removeFromCart = async(itemId) => {
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))  
        if (token) {
            await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
        }
    }  



    const getTotalCartAmount=()=>{
        let totalAmount =0;
        for(const item in cartItems)
            {
                if(cartItems[item]>0){
                let itemInfo=food_list.find((product)=>product._id===item)
                if (itemInfo) {
                    // Sử dụng giá khuyến mãi nếu có, nếu không thì dùng giá gốc
                    let itemPrice = itemInfo.isPromotion && itemInfo.promotionPrice ? itemInfo.promotionPrice : itemInfo.price;
                    
                    // Kiểm tra giá có hợp lệ không
                    if (!itemPrice || isNaN(Number(itemPrice)) || Number(itemPrice) <= 0) {
                        itemPrice = 0;
                    }
                    
                    totalAmount += Number(itemPrice) * cartItems[item];
                }
                }
            }
            return totalAmount;
    }

    const fetchFoodList=async ()=>{
        const response= await axios.get(url+"/api/food/list?forUser=true")
        setFoodList(response.data.data)
    }
    const loadCartData = async (token) => {
        const response = await axios.post(url+"/api/cart/get",{},{headers:{token}});
        setCartItems(response.data.cartData);
    }

    // Debug function to check token status
    const debugToken = () => {
        console.log('🔍 Current token in context:', token);
        console.log('🔍 Token in localStorage:', localStorage.getItem("token"));
        console.log('🔍 Token exists in context:', !!token);
        console.log('🔍 Token exists in localStorage:', !!localStorage.getItem("token"));
    }

    useEffect(()=>{
        async function loadData(){
            await fetchFoodList();
        if (localStorage.getItem("token")) {
            const localToken = localStorage.getItem("token");
            console.log('🔄 Loading token from localStorage:', localToken);
            setToken(localToken);
            await loadCartData(localToken);
        }
    }
    loadData();
    },[])

    const contextValue = {  
        food_list,  
        cartItems,  
        setCartItems,  
        addToCart,  
        removeFromCart  ,
        getTotalCartAmount,
        url,
        token,
        setToken,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        debugToken
  
    } 
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;