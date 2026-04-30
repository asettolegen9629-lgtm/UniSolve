import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Notification from './pages/Notification'
import Feedback from './pages/Feedback'
import Profile from './pages/Profile'
import Report from './pages/Report'
import { useUser } from '@clerk/clerk-react'
import Layout from './pages/Layout'
import { setClerkHeaders, usersAPI } from './services/api'
import { Loading } from './components/Loading'
// Admin pages
import AdminLayout from './pages/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/Dashboard'
import AdminManageReports from './pages/Admin/ManageReports'
import AdminManageUsers from './pages/Admin/ManageUsers'
import AdminProfile from './pages/Admin/AdminProfile'
import AdminFeedback from './pages/Admin/AdminFeedback'
import AdminNotifications from './pages/Admin/AdminNotifications'

const App = () => {
  const { user, isLoaded } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleLoading, setRoleLoading] = useState(false)

  // Update headers and detect role when user changes
  useEffect(() => {
    let active = true

    if (user) {
      setClerkHeaders(user)
      console.log('Clerk user set:', {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username
      })
      setRoleLoading(true)
      usersAPI
        .getCurrent()
        .then((current) => {
          if (!active) return
          setIsAdmin(current?.isAdmin === true)
        })
        .catch((err) => {
          console.error('Role detection failed:', err)
          if (!active) return
          setIsAdmin(false)
        })
        .finally(() => {
          if (!active) return
          setRoleLoading(false)
        })
    } else {
      setIsAdmin(false)
      setRoleLoading(false)
    }

    return () => {
      active = false
    }
  }, [user])

  if (!isLoaded || roleLoading) {
    return <Loading />
  }

  return (
    <>
      <Routes>
        <Route path='/' element={!user ? <Login /> : isAdmin ? <Navigate to="/admin" replace /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='notifications' element={isAdmin ? <Navigate to="/admin/notifications" replace /> : <Notification />} />
          <Route path='feedback' element={isAdmin ? <Navigate to="/admin/feedback" replace /> : <Feedback />} />
          <Route path='profile' element={isAdmin ? <Navigate to="/admin/profile" replace /> : <Profile />} />
          <Route path='new-report' element={isAdmin ? <Navigate to="/admin/reports" replace /> : <Report />} />
        </Route>
        {/* Admin Routes */}
        <Route path='/admin' element={!user ? <Login /> : isAdmin ? <AdminLayout /> : <Navigate to="/" replace />}>
          <Route index element={<AdminDashboard />} />
          <Route path='reports' element={<AdminManageReports />} />
          <Route path='users' element={<AdminManageUsers />} />
          <Route path='notifications' element={<AdminNotifications />} />
          <Route path='feedback' element={<AdminFeedback />} />
          <Route path='profile' element={<AdminProfile />} />
        </Route>
        <Route path='*' element={<Navigate to={user ? (isAdmin ? '/admin' : '/') : '/'} replace />} />
      </Routes>
    </>
  )
}

export default App