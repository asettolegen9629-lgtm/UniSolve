import React, { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Image, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportsAPI, usersAPI } from '../services/api'

const Report = () => {

  const [content,setContent]=useState('')
  const [category,setCategory]=useState('')
  const [images,setImages]=useState([])
  const [loading,setLoading]=useState(false);
  const { user: clerkUser } = useUser()
  const [user, setUser] = useState(null)

  // Predefined categories for campus issues
  const categories = [
    { value: 'Technical Issues', label: 'Technical Issues' },
    { value: 'WiFi/Internet', label: 'WiFi/Internet' },
    { value: 'Cleaning/Maintenance', label: 'Cleaning/Maintenance' },
    { value: 'Lighting', label: 'Lighting' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Safety/Security', label: 'Safety/Security' },
    { value: 'Heating/Cooling', label: 'Heating/Cooling' },
    { value: 'Water/Plumbing', label: 'Water/Plumbing' },
    { value: 'Cafeteria/Food', label: 'Cafeteria/Food' },
    { value: 'Parking', label: 'Parking' },
    { value: 'Other', label: 'Other' }
  ]

  React.useEffect(() => {
    const fetchUser = async () => {
      if (clerkUser) {
        try {
          // Sync user with backend
          const syncData = {
            clerkId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress,
            username: clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0],
            fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.fullName || 'User',
            profilePicture: clerkUser.imageUrl
          }
          console.log('Syncing user:', syncData)
          await usersAPI.sync(syncData)
          const userData = await usersAPI.getCurrent()
          console.log('User data received:', userData)
          setUser(userData)
        } catch (error) {
          console.error('Error fetching user:', error)
          console.error('Error details:', error.response?.data || error.message)
        }
      }
    }
    fetchUser()
  }, [clerkUser])

  const handleSubmit=async ()=>{
    if (!content || !category) {
      toast.error('Please fill in description and category')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('description', content)
      formData.append('category', category)
      images.forEach((image) => {
        formData.append('images', image)
      })

      await reportsAPI.create(formData)
      toast.success('Your report was submitted and is pending admin approval.', {
        duration: 5000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '14px',
        },
      })
      setContent('')
      setCategory('')
      setImages([])
    } catch (error) {
      console.error('Error creating report:', error)
      toast.error('Failed to create report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen  bg-gray-100'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Report</h1>
          <p className='text-slate-600'>Share your problems with campus</p>
        </div>

        {/* Form */}
        <div className='max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4'>
        {/* Header */}
        {user && (
          <div className='flex items-center gap-3'>
            <img src={user.profilePicture || clerkUser?.imageUrl} className='w-12 h-12 rounded-full shadow' alt="" />
            <div>
              <h2 className='font-semibold'>{user.fullName || clerkUser?.fullName}</h2>
              <p className='text-sm text-gray-500'>@{user.username || clerkUser?.username}</p>
            </div>
          </div>
        )}

          {/* Description Text Area */}
           <textarea 
            className='w-full resize-none min-h-24 mt-4 text-sm outline-none placeholder-gray-400 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent' 
            placeholder="Describe the problem in detail..." 
            onChange={(e)=>setContent(e.target.value)} 
            value={content}
          />
           
          {/* Category Select */}
          <div className='mt-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Category <span className='text-red-500'>*</span>
            </label>
            <select 
              className='w-full text-sm outline-none border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white cursor-pointer'
              onChange={(e)=>setCategory(e.target.value)} 
              value={category}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <p className='text-xs text-gray-500 mt-1'>Choose the category that best describes your issue</p>
          </div>

          {/* Images */}
          {
            images.length>0 && <div className='flex flex-wrap gap-2 mt-4'>
              {images.map((image,i)=>(
                <div key={i} className='relative group'>
                   <img src={URL.createObjectURL(image)}  className='h-20 rounded-md' alt="" />
                   <div onClick={()=>setImages(images.filter((_,index)=>index!==i))} className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer'>
                    <X className='w-6 h-6 text-white'/>
                   </div>
                </div>
              ))}
            </div>
          }

          {/* Bottom Bar */}
          <div className='flex items-center justify-between pt-3 border-t border-gray-300'>
            <label htmlFor="images" className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'>
              <Image className='size-6'/>
            </label>

            <input
              type="file"
              id="images"
              accept='image/*'
              hidden
              multiple
              onChange={(e)=>setImages([...images,...e.target.files])}
            />

            <button
              disabled={loading}
              onClick={handleSubmit}
              className='text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
            >
               {loading ? 'Publishing...' : 'Publish Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Report