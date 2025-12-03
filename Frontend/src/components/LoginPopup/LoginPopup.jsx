import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import {assets} from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { useAuth } from '../../Context/AuthContext'


const LoginPopup = ({setShowLogin}) => {

    const {url} = useContext(StoreContext)
    const { login, register, authError, setAuthError } = useAuth()

    const [currState,setCurrState]=useState("Sign-Up")
    const [data,setData] =useState({
        name:"",
        email:"",
        password:""
    })
    const [loading, setLoading] = useState(false)

    const onChangeHandler=(event) =>{
        const name = event.target.name;
        const value = event.target.value;
        setData(data =>({...data,[name]:value}))
        // Clear error when user types
        if (authError) {
            setAuthError(null);
        }
    }

    const OnLogin = async (event)=>{
        event.preventDefault()
        setLoading(true)
        setAuthError(null)

        try {
            let result;
            if (currState==="Login") {
                result = await login(data.email, data.password);
            } else {
                result = await register(data.name, data.email, data.password);
            }

            if (result.success) {
                setShowLogin(false)
                // Reset form
                setData({ name: "", email: "", password: "" });
            } else {
                // Error is already set in AuthContext via setAuthError
                // It will be displayed below
            }
        } catch (error) {
            console.error("Login error:", error);
            setAuthError(error.message || "An error occurred");
        } finally {
            setLoading(false)
        }
    }
  return (
    <div className='login-popup'>
        <form onSubmit={OnLogin} className='login-popup-container'>
            <div className='login-popup-title'>
                <h2>{currState}</h2>
                <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt=''></img>
            </div>
            {authError && (
                <div className="login-popup-error">
                    {authError}
                </div>
            )}
            <div className="login-popup-inputs">
                {currState==="Login"?<></>:<input name='name' onChange={onChangeHandler}  value={data.name} type='text' placeholder='Your Name' required/>}     
                <input name='email' onChange={onChangeHandler} value={data.email} type='email' placeholder='Your Email' required/>
                <input name='password' onChange={onChangeHandler} value={data.password} type='password' placeholder='Password' required/>

            </div>
            <button type='submit' disabled={loading}>
                {loading ? 'Please wait...' : (currState==="Sign-Up"?"Create Account":"Login")}
            </button>
           <div className="login-popup-condition">
            <input type='checkbox' required></input>
            <p>By continuing,I agree to the terms of use & privacy policy.</p>
           </div>
           {currState==="Login"
                ?<p>Create a new account?<span onClick={()=>setCurrState("Sign-Up")}>Click here</span></p>
                :<p>Already have an account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>
                
            }
        </form>

    </div>
  )
}

export default LoginPopup