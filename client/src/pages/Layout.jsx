import React, { useState } from 'react'
import SideBar from '../components/SideBar'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Loading } from '../components/Loading'
import { useUser } from '@clerk/clerk-react'

const Layout = () => {
  const { user, isLoaded } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isLoaded) {
    return <Loading/>
  }

  return user ? (
    <div className='w-full flex h-screen overflow-hidden'>
        <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>

        <div className='flex-1 bg-slate-50 overflow-y-auto'>
           <Outlet/>
        </div>
        {
            sidebarOpen ?
            <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 text-grey-600 sm:hidden' onClick={()=> setSidebarOpen(false)}/>
            :
            <Menu className='absolute top-3 right-3 p-2 x-100 bg-white rounded-md shadow w-10 h-10 text-grey-600 sm:hidden' onClick={()=> setSidebarOpen(true)}/>
        }
    </div>
  ) : (
    <Loading/>
  )
}

export default Layout