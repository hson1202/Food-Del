import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter} from "react-router-dom"

// Error boundary cho production
const root = ReactDOM.createRoot(document.getElementById('root'))

try {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
} catch (error) {
  console.error('Error rendering app:', error)
  root.render(
    <div style={{padding: '20px', textAlign: 'center'}}>
      <h1>Something went wrong</h1>
      <p>Please check the console for errors</p>
      <pre>{error.message}</pre>
    </div>
  )
}
