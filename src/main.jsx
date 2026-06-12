import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import BookingPage from './components/BookingPage.jsx'
import './index.css'

const path = window.location.pathname
const isBooking = path === '/book' || path.startsWith('/book/')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isBooking ? <BookingPage /> : <App />}
  </React.StrictMode>,
)
