import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import MenuItems from './MenuItems'
import { CirclePlus, LogOut } from 'lucide-react'
import {UserButton, useClerk, useUser} from '@clerk/clerk-react'
import { usersAPI } from '../services/api'

const SideBar = ({sidebarOpen,setSidebarOpen}) => {
    const navigate=useNavigate()
    const {user: clerkUser} = useUser()
    const {signOut}=useClerk()

    const [profilePic, setProfilePic] = useState(clerkUser?.imageUrl || assets.sample_profile)
    const [fullName, setFullName] = useState('User')
    const [username, setUsername] = useState('user')

    useEffect(() => {
      // Set initial from Clerk (highest priority for latest avatar)
      if (clerkUser) {
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.fullName || 'User'
        const uname = clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'user'
        const clerkAvatar = clerkUser.imageUrl || assets.sample_profile
        setFullName(name)
        setUsername(uname)
        setProfilePic(clerkAvatar)
      }

      const fetchUserProfile = async () => {
        try {
          const backendUser = await usersAPI.getCurrent()
          if (backendUser) {
            const backendAvatar = backendUser.profilePicture
            // If backend has avatar, prefer it; else keep Clerk avatar
            setFullName(backendUser.fullName || backendUser.username || fullName)
            setUsername(backendUser.username || username)
            if (backendAvatar) {
              setProfilePic(backendAvatar)
            } else if (clerkUser?.imageUrl) {
              // Persist Clerk avatar to backend so it survives refresh
              await usersAPI.update({ profilePicture: clerkUser.imageUrl })
              setProfilePic(clerkUser.imageUrl)
            }
          } else if (clerkUser?.imageUrl) {
            // Persist Clerk avatar if backend user missing avatar
            await usersAPI.update({ profilePicture: clerkUser.imageUrl })
          }
        } catch (error) {
          console.error('Error fetching/syncing profile for sidebar:', error)
        }
      }

      fetchUserProfile()
    }, [clerkUser])
    
  return (
    <div className={`w-60 xl:w-72 bg-white border-r border-grey-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? 'traslate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
         <div className='w-full'>
             <img onClick={()=>navigate('/')} src={assets.logo2} className='w-26 ml-7 my-2 cursor-pointer' alt="" />
             <hr className='border-grey-300 mb-8' />
            <MenuItems setSidebarOpen={setSidebarOpen}/>
             
            <Link to='/new-report' className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-700 hover:to-orange-800 active:scale-95 transition text-white cursor-pointer'>
               <CirclePlus className='w-5 h-5'/>
                New Report
            </Link>
         </div>

         <div className='w-full border-t border-grey-200 p-4 px-7 flex items-center justify-between'>
                 <div className='flex gap-2 items-center cursor-pointer'>
                    <UserButton/>
                    <div>
                        <h1 className='text-sm font-meduim'>{fullName}</h1>
                        <p className='text-xs text-grey-500'>@{username}</p>
                    </div>
                 </div>
                 <LogOut onClick={signOut} className='w-4.5 text-grey-400 hover:text-grey-700 transition cursor-pointer'/>
         </div>
    </div>
  )
}

export default SideBar