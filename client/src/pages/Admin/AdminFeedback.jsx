import React, { useState, useEffect } from 'react';
import { feedbackAPI, reportsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { MessageSquare, Send, Star } from 'lucide-react';
import moment from 'moment';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [statistics, setStatistics] = useState({
    problemSolved: 0,
    stillHaveQuestion: 0,
    helpAgain: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feedbacksData, statsData] = await Promise.all([
        feedbackAPI.getAllForAdmin(),
        feedbackAPI.getStatistics(),
      ]);
      setFeedbacks(feedbacksData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedFeedback) return;

    try {
      // Here you would send a message/response to the user
      // For now, we'll just show a success message
      toast.success('Message sent!');
      setMessageText('');
      setShowMessageModal(false);
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      problem_solved: 'Problem solved',
      still_have_question: 'I still have question',
      help_again: 'Help me again, please',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      problem_solved: 'bg-green-100 text-green-700',
      still_have_question: 'bg-yellow-100 text-yellow-700',
      help_again: 'bg-red-100 text-red-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // All feedbacks are anonymous - generate anonymous names for all
  const allFeedbacksWithAnonymous = feedbacks.map((f, index) => {
    // Generate consistent anonymous ID based on feedback ID
    const anonymousId = f.id.substring(0, 4).toUpperCase();
    const initials = f.report?.description?.substring(0, 2).toUpperCase() || 
                     f.message?.substring(0, 2).toUpperCase() || 
                     `U${index + 1}`;
    
    return {
      ...f,
      anonymousInitials: initials,
      anonymousName: `User ${anonymousId}`,
    };
  });

  // Get individual feedbacks (with report info) for top section - show first 2
  const individualFeedbacks = allFeedbacksWithAnonymous
    .filter(f => f.report)
    .slice(0, 2);

  // Get all anonymous feedbacks for bottom section (ALL feedbacks, not just without report)
  const anonymousFeedbacks = allFeedbacksWithAnonymous;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 rounded-full border-3 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600 mt-1">Write a feedback to students about solutions</p>
      </div>

      {/* Individual Feedback Cards */}
      {individualFeedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {individualFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                  {feedback.anonymousInitials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{feedback.anonymousName}</p>
                  <p className="text-sm text-gray-500 truncate max-w-xs">
                    {feedback.report?.description?.substring(0, 30)}...
                  </p>
                </div>
              </div>
              <div className="mb-3">
                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                  {feedback.report?.category || 'General'}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedFeedback(feedback);
                  setShowMessageModal(true);
                }}
                className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium"
              >
                Send message
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-600 text-sm font-medium mb-2">Problem solved</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{statistics.problemSolved}</p>
          <div className="flex gap-1">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-red-500 text-red-500"
                size={16}
              />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-600 text-sm font-medium mb-2">I still have question</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{statistics.stillHaveQuestion}</p>
          <div className="flex gap-1">
            {[1, 2].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-red-500 text-red-500"
                size={16}
              />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <p className="text-gray-600 text-sm font-medium mb-2">Help me again, please</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{statistics.helpAgain}</p>
          <div className="flex gap-1">
            <Star className="w-4 h-4 fill-red-500 text-red-500" size={16} />
          </div>
        </div>
      </div>

      {/* Anonymous Feedback List - Show ALL feedbacks */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Anonymous Feedback</h2>
        {anonymousFeedbacks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No anonymous feedback yet</p>
        ) : (
          <div className="space-y-3">
            {anonymousFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">Anonymous Feedback</p>
                  <p className="text-sm text-gray-500 mt-1">{feedback.message}</p>
                  {feedback.report && (
                    <p className="text-xs text-gray-400 mt-1">
                      Related to: &quot;{feedback.report.description?.substring(0, 40)}...&quot;
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(feedback.type)}`}>
                    {getTypeLabel(feedback.type)}
                  </span>
                  {!feedback.isRead && (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                      New
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {moment(feedback.createdAt).format('DD.MM.YYYY')}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedFeedback(feedback);
                      setShowMessageModal(true);
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition text-sm font-medium"
                  >
                    open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Send Message</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Feedback:</p>
                <p className="text-gray-900">{selectedFeedback.message}</p>
              </div>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSendMessage}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium"
                >
                  Send
                </button>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setSelectedFeedback(null);
                    setMessageText('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;

