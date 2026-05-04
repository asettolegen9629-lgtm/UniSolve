import React, { useEffect, useState } from 'react'
import { Loading } from '../components/Loading'
import PostCard from '../components/PostCard'
import { reportsAPI, API_URL, toAbsoluteApiUrl } from '../services/api'
import { useUser } from '@clerk/clerk-react'

const Feed = () => {

  const [feeds,setfeeds]=useState([]) 
  const [pendingFeeds, setPendingFeeds] = useState([])
  const [loading,setLoading]=useState(true) 
  const { user: clerkUser } = useUser()

  const fetchFeeds= async()=>{
    try {
      console.log('Fetching feeds from:', API_URL)
      
      // Get approved reports (visible to everyone)
      const approvedData = await reportsAPI.getAll()
      console.log('Received approved data:', approvedData)
      
      // Transform approved data to match frontend format
      const transformedApproved = approvedData.map(report => {
        const likesCount = (report.likes || []).length;
        const commentsCount = (report.comments || []).length;
        const popularityScore = likesCount + commentsCount; // Popularity = likes + comments
        
        return {
          _id: report.id,
          user: {
            _id: report.user?.id || 'unknown',
            full_name: report.user?.fullName || 'Unknown User',
            username: report.user?.username || 'unknown',
            profile_picture: toAbsoluteApiUrl(report.user?.profilePicture || '')
          },
          content: report.description || '',
          image_urls: (report.images || []).map(img => {
            const url = img.url || img;
            return toAbsoluteApiUrl(url);
          }),
          likes_count: (report.likes || []).map(like => like.user?.id || like.userId),
          createdAt: report.createdAt,
          category: report.category || 'Uncategorized',
          status: report.status || 'in-progress',
          comments: report.comments || [],
          isApproved: true,
          popularityScore // Add popularity score for sorting
        }
      })
      
      // Get user's pending reports (if logged in)
      let pendingData = []
      if (clerkUser) {
        try {
          const myReports = await reportsAPI.getMyReports()
          pendingData = (myReports || []).filter(report => !report.isApproved)
          console.log('Received pending reports:', pendingData)
        } catch (error) {
          console.error('Error fetching pending reports:', error)
        }
      }
      
      // Transform pending data
      const transformedPending = pendingData.map(report => ({
        _id: report.id,
        user: {
          _id: report.user?.id || 'unknown',
          full_name: report.user?.fullName || 'Unknown User',
          username: report.user?.username || 'unknown',
          profile_picture: toAbsoluteApiUrl(report.user?.profilePicture || '')
        },
        content: report.description || '',
        image_urls: (report.images || []).map(img => {
          const url = img.url || img;
          return toAbsoluteApiUrl(url);
        }),
        likes_count: (report.likes || []).map(like => like.user?.id || like.userId),
        createdAt: report.createdAt,
        category: report.category || 'Uncategorized',
        status: report.status || 'in-progress',
        comments: report.comments || [],
        isApproved: false
      }))
      
      // Sort by popularity: popular posts first (likes + comments), then by date
      const sortedApproved = transformedApproved.sort((a, b) => {
        // First sort by popularity (likes + comments)
        if (b.popularityScore !== a.popularityScore) {
          return b.popularityScore - a.popularityScore;
        }
        // If same popularity, sort by date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Separate popular posts (popularityScore >= 3) from regular posts
      const popularPosts = sortedApproved.filter(post => post.popularityScore >= 3);
      const regularPosts = sortedApproved.filter(post => post.popularityScore < 3);

      // Combine: popular first, then regular (both sorted by popularity/date)
      const finalSorted = [...popularPosts, ...regularPosts];

      setfeeds(finalSorted)
      setPendingFeeds(transformedPending)
    } catch (error) {
      console.error('Error fetching feeds:', error)
      console.error('Error details:', error.response?.data || error.message)
      // Show user-friendly error
      alert(`Failed to load feeds. Please check backend: ${API_URL}`)
      setfeeds([])
      setPendingFeeds([])
    } finally {
    setLoading(false)
    }
  }
  
  useEffect(()=>{
    fetchFeeds()
  },[clerkUser])

  // Refresh feeds when comments are added (callback from PostCard)
  const handleCommentAdded = () => {
    fetchFeeds()
  }

  return !loading ? (
   <div className='f-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8 bg-gray-100'>
      {/* Post list */}
     <div>
       <div className='p-4 space-y-6'>
          {/* Pending reports (user's own reports waiting for approval) */}
          {pendingFeeds.map((post)=>(
            <PostCard key={`pending-${post._id}`} post={post} isPending={true}/>
          ))}
          
          {/* Approved reports (visible to everyone) */}
          {feeds.map((post)=>(
            <PostCard 
              key={post._id} 
              post={{...post, onCommentAdded: handleCommentAdded}} 
              isPending={false}
              isPopular={post.popularityScore >= 3}
            />
          ))}
       </div>
     </div>
   </div>
  ):( <Loading/>

  )
}

export default Feed