import React, { useState, useEffect } from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { notificationsAPI, usersAPI } from '../services/api'
import { useUser } from '@clerk/clerk-react'
import { Shield } from 'lucide-react'

const MenuItems = ({setSidebarOpen}) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user: clerkUser } = useUser()

  useEffect(() => {
    if (clerkUser) {
      fetchUnreadCount()
      checkAdminStatus()
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      // Refresh admin status every 10 seconds (in case it was changed)
      const adminInterval = setInterval(checkAdminStatus, 10000)
      const onUpdated = () => fetchUnreadCount()
      window.addEventListener('notifications-updated', onUpdated)
      return () => {
        clearInterval(interval)
        clearInterval(adminInterval)
        window.removeEventListener('notifications-updated', onUpdated)
      }
    }
  }, [clerkUser])

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsAPI.getUnreadCount()
      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const checkAdminStatus = async () => {
    try {
      const userData = await usersAPI.getCurrent()
      console.log('Admin check - User data:', userData)
      console.log('Admin check - isAdmin value:', userData?.isAdmin)
      const adminStatus = userData?.isAdmin === true
      setIsAdmin(adminStatus)
      console.log('Admin check - Setting isAdmin to:', adminStatus)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  return (
    <div className='px-6 text-gray-600 space-y-1 font-medium'>
       {
        menuItemsData.map(({to,label,Icon})=>(
           <NavLink 
             key={to} 
             to={to} 
             end={to==='/'} 
             onClick={()=>setSidebarOpen(false)} 
             className={({isActive})=>`px-3.5 py-2 flex items-center gap-3 rounded-xl relative ${isActive ? 'bg-amber-100 text-grey-500' : 'hover:bg-grey-50'}`}
           >
               <Icon className="w-5 h-5"/>
               {label}
               {to === '/notifications' && unreadCount > 0 && (
                 <span className='absolute left-6 top-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                   {unreadCount > 9 ? '9+' : unreadCount}
                 </span>
               )}
           </NavLink>
        ))
       }
       {/* Admin Panel Link - Only visible to admins */}
       {isAdmin && (
         <NavLink 
           to="/admin" 
           onClick={()=>setSidebarOpen(false)} 
           className={({isActive})=>`px-3.5 py-2 flex items-center gap-3 rounded-xl relative mt-2 ${isActive ? 'bg-purple-100 text-purple-700' : 'hover:bg-purple-50 text-purple-600'}`}
         >
           <Shield className="w-5 h-5"/>
           Admin Panel
         </NavLink>
       )}
       {/* Debug: Show admin status */}
       {process.env.NODE_ENV === 'development' && (
         <div className="px-3.5 py-1 text-xs text-gray-400">
           Admin: {isAdmin ? 'Yes' : 'No'}
         </div>
       )}
    </div>
  )
}

export default MenuItems