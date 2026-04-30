import React from 'react'

export const Loading = ({height='100vh'}) => {
  return (
    <div style={{height}} className='flex flex-col items-center justify-center h-screen gap-3 bg-white'>
        <div className='w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin'></div>
        <p className='text-sm text-gray-500'>Loading...</p>
    </div>
  )
}
