import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import {assets} from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import { useAuth } from '../../Context/AuthContext'
import { useTranslation } from 'react-i18next'


const LoginPopup = ({setShowLogin}) => {
    const { t } = useTranslation()
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
                <h2>{currState === "Sign-Up" ? t('login.signUp') : t('login.login')}</h2>
                <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt=''></img>
            </div>
            {authError && (
                <div className="login-popup-error">
                    {authError}
                </div>
            )}
            <div className="login-popup-inputs">
                {currState==="Login"?<></>:<input name='name' onChange={onChangeHandler}  value={data.name} type='text' placeholder={t('login.yourName')} required/>}     
                <input name='email' onChange={onChangeHandler} value={data.email} type='email' placeholder={t('login.yourEmail')} required/>
                <input name='password' onChange={onChangeHandler} value={data.password} type='password' placeholder={t('login.password')} required/>

            </div>
            <button type='submit' disabled={loading}>
                {loading ? t('login.pleaseWait') : (currState==="Sign-Up"? t('login.createAccount') : t('login.login'))}
            </button>
           <div className="login-popup-condition">
            <input type='checkbox' required></input>
            <p>{t('login.terms')}</p>
           </div>
           {currState==="Login"
                ?<p>{t('login.createNewAccount')} <span onClick={()=>setCurrState("Sign-Up")}>{t('login.clickHere')}</span></p>
                :<p>{t('login.alreadyHaveAccount')} <span onClick={()=>setCurrState("Login")}>{t('login.loginHere')}</span></p>
                
            }
        </form>

    </div>
  )
}

export default LoginPopup