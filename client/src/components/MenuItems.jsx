import React, { useState, useEffect } from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { notificationsAPI } from '../services/api'
import { useUser } from '@clerk/clerk-react'

const MenuItems = ({setSidebarOpen}) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const { user: clerkUser } = useUser()

  useEffect(() => {
    if (clerkUser) {
      fetchUnreadCount()
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      const onUpdated = () => fetchUnreadCount()
      window.addEventListener('notifications-updated', onUpdated)
      return () => {
        clearInterval(interval)
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
    </div>
  )
}

export default MenuItems