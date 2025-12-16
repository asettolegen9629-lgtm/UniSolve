import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Notification from './pages/Notification'
import Feedback from './pages/Feedback'
import Profile from './pages/Profile'
import Report from './pages/Report'
import {useUser} from '@clerk/clerk-react'
import Layout from './pages/Layout'
import { setClerkHeaders } from './services/api'

const App = () => {
  const {user} = useUser()
  
  // Update headers when user changes
  useEffect(() => {
    if (user) {
      setClerkHeaders(user);
      console.log('Clerk user set:', {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username
      });
    }
  }, [user]);
  
  return (
    <>
    <Routes>
      <Route path='/' element={!user? <Login />:<Layout/>}>
        <Route index element={<Feed/>}/>
        <Route path='notifications' element={<Notification/>}/>
        <Route path='feedback' element={<Feedback/>}/>
        <Route path='profile' element={<Profile/>}/>
        <Route path='new-report' element={<Report/>}/>
      </Route>
    </Routes>
    </>
  )
}

export default App