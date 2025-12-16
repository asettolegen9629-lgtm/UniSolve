import React, { useEffect, useState } from "react";
import { reportsAPI } from "../services/api";
import { Loading } from "../components/Loading";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

const styles = {
  pageContainer: {
    padding: '30px',
    backgroundColor: '#f7f7f7',
    minHeight: '100vh',
    fontFamily: 'Inter, sans-serif',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '5px',
  },
  pageSubtitle: {
    color: '#777',
    marginBottom: '30px',
  },
  cardsGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  cardAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    marginRight: '10px',
    backgroundColor: '#D32F2F',
  },
  cardReportTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#555',
  },
  cardDescription: {
    fontSize: '15px',
    color: '#333',
    fontWeight: 500,
    margin: '0 0 15px 0',
    lineHeight: 1.4,
  },
  cardTagsStatusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  categoryTag: {
    backgroundColor: '#e0e0e0',
    color: '#555',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  statusTag: {
    backgroundColor: '#e8f5e9',
    color: '#4caf50',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  rateButton: {
    backgroundColor: '#E65100',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '15px',
    transition: 'background-color 0.2s',
    outline: 'none',
  },
  starsContainer: {
    display: 'flex',
    gap: '4px',
    marginBottom: '12px',
    alignItems: 'center',
  },
  starButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    outline: 'none',
  },
  starFilled: {
    color: '#FFB300',
  },
  starEmpty: {
    color: '#ddd',
  },
  ratingText: {
    marginLeft: '8px',
    fontSize: '14px',
    color: '#555',
    fontWeight: 500,
  },
};

// Компонент звездного рейтинга
const StarRating = ({ reportId, currentRating, onRatingChange }) => {
  const [hoveredRating, setHoveredRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = async (rating) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await reportsAPI.rateByUser(reportId, rating);
      toast.success(`You rated this resolution ${rating} star${rating > 1 ? 's' : ''}`);
      onRatingChange(rating);
    } catch (error) {
      console.error('Error rating report:', error);
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || currentRating || 0;

  return (
    <div style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          style={styles.starButton}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(null)}
          disabled={isSubmitting}
          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={24}
            fill={star <= displayRating ? '#FFB300' : 'none'}
            color={star <= displayRating ? '#FFB300' : '#ddd'}
            style={{
              transition: 'all 0.2s',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          />
        </button>
      ))}
      {currentRating && (
        <span style={styles.ratingText}>
          Your rating: {currentRating}/5
        </span>
      )}
      {!currentRating && (
        <span style={{ ...styles.ratingText, color: '#999', fontSize: '12px' }}>
          Click to rate
        </span>
      )}
    </div>
  );
};

// Карточка отзыва по одному решённому репорту
const FeedbackCard = ({ 
  reportId,
  title, 
  resolvedDate, 
  category, 
  status, 
  initial, 
  adminRating,
  userRating,
  onRatingUpdate
}) => {
  const handleRatingChange = (newRating) => {
    onRatingUpdate(reportId, newRating);
  };

  return (
    <div style={styles.cardContainer}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={styles.cardAvatar}>{initial}</div>
        <strong style={styles.cardReportTitle}>Your Report</strong>
      </div>

      {/* Details */}
      <p style={styles.cardDescription}>
        {title} - Resolved on <span style={{color: '#777', fontWeight: 400}}>{resolvedDate}</span>
      </p>

      {/* Tags and Status */}
      <div style={styles.cardTagsStatusRow}>
        {/* Category Tag */}
        <span style={styles.categoryTag}>
          {category}
        </span>
        {/* Status Tag */}
        <span style={styles.statusTag}>
          {status}
        </span>
      </div>

      {/* Admin rating (если есть) */}
      {adminRating != null && (
        <div style={{ marginBottom: '12px', fontSize: '14px', color: '#555' }}>
          Admin rating: <strong>{adminRating}/5</strong>
        </div>
      )}

      {/* User rating - интерактивные звезды */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px', fontWeight: 500 }}>
          Rate this resolution:
        </div>
        <StarRating 
          reportId={reportId}
          currentRating={userRating}
          onRatingChange={handleRatingChange}
        />
      </div>
    </div>
  );
};

// Основной компонент Feedback – показывает решённые репорты текущего пользователя
const Feedback = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleRatingUpdate = (reportId, newRating) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === reportId ? { ...item, userRating: newRating } : item
      )
    );
  };

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        // Берём репорты текущего пользователя
        const myReports = await reportsAPI.getMyReports();

        // Оставляем только решённые (status === 'done')
        const solvedReports = (myReports || []).filter(
          (r) => (r.status || '').toLowerCase() === 'done'
        );

        const mapped = solvedReports.map((report) => {
          const fullName = report.user?.fullName || report.user?.username || "User";
          const initials = fullName
            .split(" ")
            .filter(Boolean)
            .map((p) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const date = report.updatedAt || report.createdAt;
          const resolvedDate = date
            ? new Date(date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Unknown date";

          return {
            id: report.id,
            title: report.description,
            resolvedDate,
            category: report.category || "General",
            status: "Solved",
            initial: initials || "U",
            adminRating: report.adminRating ?? null,
            userRating: report.userRating ?? null,
          };
        });

        setItems(mapped);
      } catch (error) {
        console.error("Error loading feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Feedback</h1>
      <p style={styles.pageSubtitle}>See how your reports were resolved by admin</p>

      {items.length === 0 ? (
        <p style={{ color: "#777" }}>
          You don&apos;t have solved reports yet. Once admin marks your report as done, it
          will appear here.
        </p>
      ) : (
        <div style={styles.cardsGrid}>
          {items.map((item) => (
            <FeedbackCard
              key={item.id}
              reportId={item.id}
              title={item.title}
              resolvedDate={item.resolvedDate}
              category={item.category}
              status={item.status}
              initial={item.initial}
              adminRating={item.adminRating}
              userRating={item.userRating}
              onRatingUpdate={handleRatingUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;