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
  /** When user is signed in, we must not render routes until /users/me completes for that session (fixes blank/wrong route flash). */
  const [resolvedUserId, setResolvedUserId] = useState(null)

  useEffect(() => {
    let active = true

    if (!user) {
      setIsAdmin(false)
      setResolvedUserId(null)
      return () => {
        active = false
      }
    }

    setClerkHeaders(user)

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
        setResolvedUserId(user.id)
      })

    return () => {
      active = false
    }
  }, [user])

  if (!isLoaded) {
    return <Loading />
  }

  if (user && resolvedUserId !== user.id) {
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