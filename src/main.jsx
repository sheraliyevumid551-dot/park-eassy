import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ParkingProvider } from './context/ParkingContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ParkingProvider>
        <App />
      </ParkingProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
