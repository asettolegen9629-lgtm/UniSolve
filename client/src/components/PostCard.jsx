import React, { useState, useEffect } from 'react'
import { BadgeCheck, Heart, MessageCircle, Send, TrendingUp } from 'lucide-react'
import moment from 'moment'
import { useUser } from '@clerk/clerk-react'
import { likesAPI, commentsAPI, toAbsoluteApiUrl } from '../services/api'
import toast from 'react-hot-toast'

const PostCard = ({post, isPending = false, isPopular = false}) => {

    const[likes,setLikes]=useState(post.likes_count || [])
    const [comments, setComments] = useState(post.comments || [])
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [loadingComment, setLoadingComment] = useState(false)
    const { user: clerkUser } = useUser()
    const currentUserId = clerkUser?.id

    // Fetch comments when showing comments section
    useEffect(() => {
      if (showComments && !isPending) {
        fetchComments()
      }
    }, [showComments, post._id])

    const fetchComments = async () => {
      try {
        const fetchedComments = await commentsAPI.getByReport(post._id)
        setComments(fetchedComments || [])
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }

    const handleLike=async()=>{
      if (!currentUserId || isPending) return // Don't allow likes on pending reports
      try {
        const result = await likesAPI.toggleReportLike(post._id)
        // Refresh likes
        const updatedLikes = await likesAPI.getReportLikes(post._id)
        setLikes(updatedLikes.map(like => like.user.id))
      } catch (error) {
        console.error('Error toggling like:', error)
      }
    }

    const handleCommentSubmit = async (e) => {
      e.preventDefault()
      if (!commentText.trim() || !currentUserId || isPending) return

      setLoadingComment(true)
      try {
        await commentsAPI.create(post._id, commentText.trim())
        setCommentText('')
        toast.success('Comment added!')
        // Refresh comments
        await fetchComments()
        // Update parent component to refresh post data
        if (post.onCommentAdded) {
          post.onCommentAdded()
        }
      } catch (error) {
        console.error('Error creating comment:', error)
        toast.error('Failed to add comment')
      } finally {
        setLoadingComment(false)
      }
    }

    const handleReplySubmit = async (e, parentCommentId) => {
      e.preventDefault()
      if (!replyText.trim() || !currentUserId || isPending) return

      setLoadingComment(true)
      try {
        await commentsAPI.create(post._id, replyText.trim(), parentCommentId)
        setReplyText('')
        setReplyingTo(null)
        toast.success('Reply added!')
        // Refresh comments
        await fetchComments()
        // Update parent component to refresh post data
        if (post.onCommentAdded) {
          post.onCommentAdded()
        }
      } catch (error) {
        console.error('Error creating reply:', error)
        toast.error('Failed to add reply')
      } finally {
        setLoadingComment(false)
      }
    }

    const toggleComments = () => {
      if (!isPending) {
        setShowComments(!showComments)
      }
    }

  return (
    <div className={`bg white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl ${isPending ? 'bg-white/50 opacity-60' : 'bg-white'} ${isPopular ? 'ring-2 ring-orange-400' : ''}`}>
        {/* Popular badge */}
        {isPopular && !isPending && (
          <div className='flex items-center gap-2 mb-2'>
            <div className='flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-xs font-semibold'>
              <TrendingUp className='w-3 h-3' />
              <span>Popular</span>
            </div>
          </div>
        )}

        {/* user info */}
        <div className='inline-flex items-center gap-3 cursor-pointer'>
            <img src={post.user.profile_picture} alt="" className='w-10 h-10 rounded-full shadow'/>
            <div>
                <div className='flex items-center space-x-1'>
                    <span>{post.user.full_name}</span>
                </div>
                <div className='flex items-center gap-2 text-gray-500 text-sm'>
                    <span>@{post.user.username}</span>
                    <span>•</span>
                    <span>{moment(post.createdAt).fromNow()}</span>
                    <span className='px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium'>
                        {post.category}
                    </span>
                    <span className='px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-medium'>
                        {post.status}
                    </span>
                </div>
            </div>
        </div>
        {/* Content */}
       {post.content && <div className='text-grey-800 text-sm whitespace-pre-line' dangerouslySetInnerHTML={{__html: post.content}}/>}
        
        {/* Images */}
        {post.image_urls && post.image_urls.length > 0 && (
          <div className='grid grid-cols-2 gap-2'>
            {post.image_urls.map((img,index)=>(
              <img 
                src={toAbsoluteApiUrl(img)} 
                key={index} 
                className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length===1 && 'col-span-2 h-auto'}`}
                alt="" 
              />
            ))}
          </div>
        )}

        {/* Pending approval message */}
        {isPending && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2'>
            <p className='text-sm text-yellow-800 font-medium text-center'>
              ⏳ Awaiting approval from admin
            </p>
          </div>
        )}

        {/* Actions */}
        <div className='flex items-center gap-4 text grey-600 text-sm pt-2 border-t border-grey-300'>
            <div className='flex items-center gap-1 cursor-pointer hover:text-red-500 transition' onClick={handleLike}>
                <Heart className={`w-4 h-4 ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${currentUserId && likes.includes(currentUserId) && !isPending && 'text-red-500 fill-red-500'}`} />
                <span>{likes.length}</span>
            </div>
           
            <div 
              className='flex items-center gap-1 cursor-pointer hover:text-blue-500 transition' 
              onClick={toggleComments}
            >
                <MessageCircle className={`w-4 h-4 ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} />
                <span>{comments.length}</span>
            </div>
        </div>

        {/* Comments Section */}
        {showComments && !isPending && (
          <div className='border-t border-gray-200 pt-4 space-y-3'>
            {/* Comment form */}
            {currentUserId && (
              <form onSubmit={handleCommentSubmit} className='flex gap-2'>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
                  disabled={loadingComment}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || loadingComment}
                  className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm'
                >
                  <Send className='w-4 h-4' />
                  {loadingComment ? 'Sending...' : 'Send'}
                </button>
              </form>
            )}

            {/* Comments list */}
            <div className='space-y-3 max-h-64 overflow-y-auto'>
              {comments.length === 0 ? (
                <p className='text-gray-500 text-sm text-center py-4'>No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className='space-y-2'>
                    <div className='flex gap-3'>
                      <img 
                        src={comment.user?.profilePicture || comment.user?.profile_picture || 'https://via.placeholder.com/32'} 
                        alt="" 
                        className='w-8 h-8 rounded-full'
                      />
                      <div className='flex-1'>
                        <div className='bg-gray-50 rounded-lg p-3'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='font-semibold text-sm'>{comment.user?.fullName || comment.user?.full_name || 'Unknown'}</span>
                            <span className='text-gray-500 text-xs'>@{comment.user?.username || 'unknown'}</span>
                            <span className='text-gray-400 text-xs'>•</span>
                            <span className='text-gray-400 text-xs'>{moment(comment.createdAt).fromNow()}</span>
                          </div>
                          <p className='text-sm text-gray-800'>{comment.content}</p>
                        </div>
                        {/* Reply button */}
                        {!isPending && currentUserId && (
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className='mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium'
                          >
                            {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Reply form */}
                    {replyingTo === comment.id && currentUserId && (
                      <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className='ml-11 flex gap-2'>
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.user?.fullName || comment.user?.full_name || 'user'}...`}
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
                          disabled={loadingComment}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!replyText.trim() || loadingComment}
                          className='px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm'
                        >
                          {loadingComment ? 'Sending...' : 'Send'}
                        </button>
                      </form>
                    )}
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className='ml-11 space-y-2 border-l-2 border-gray-200 pl-3'>
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className='flex gap-3'>
                            <img 
                              src={reply.user?.profilePicture || reply.user?.profile_picture || 'https://via.placeholder.com/32'} 
                              alt="" 
                              className='w-6 h-6 rounded-full'
                            />
                            <div className='flex-1'>
                              <div className='bg-gray-50 rounded-lg p-2'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <span className='font-semibold text-xs'>{reply.user?.fullName || reply.user?.full_name || 'Unknown'}</span>
                                  <span className='text-gray-500 text-xs'>@{reply.user?.username || 'unknown'}</span>
                                  <span className='text-gray-400 text-xs'>•</span>
                                  <span className='text-gray-400 text-xs'>{moment(reply.createdAt).fromNow()}</span>
                                </div>
                                <p className='text-xs text-gray-800'>{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
    </div>
       
  )
}

export default PostCard
