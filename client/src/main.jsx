import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { ClerkProvider, useUser } from '@clerk/clerk-react'
import { setClerkHeaders } from './services/api'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

// Component to set up API headers when user is available
const AppWithAuth = () => {
  const { user } = useUser()
  
  React.useEffect(() => {
    if (user) {
      setClerkHeaders(user)
    }
  }, [user])
  
  return <App />
}

createRoot(document.getElementById('root')).render(
   <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <BrowserRouter>
          <AppWithAuth />
    </BrowserRouter>
 </ClerkProvider>
  
    
)
