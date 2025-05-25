// Calculate gym tags based on review frequency
export const calculateGymTags = (reviews, threshold = 0.25) => {
  // If there are no reviews, return empty array
  if (!reviews || reviews.length === 0) return [];
  
  // Count occurrence of each tag
  const tagCounts = {};
  
  // Count total number of reviews
  const totalReviews = reviews.length;
  
  // Iterate through all reviews and count tag occurrences
  reviews.forEach(review => {
    if (review.Tags && Array.isArray(review.Tags)) {
      review.Tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  // Calculate percentage for each tag and filter by threshold
  const gymTags = Object.entries(tagCounts)
    .filter(([_, count]) => count / totalReviews >= threshold)
    .map(([tag, count]) => ({
      tag,
      count,
      percentage: (count / totalReviews * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count); // Sort by frequency (most frequent first)
  
  return gymTags;
};

// Calculate average rating from messages
export const calculateAverageRating = (messages) => {
  if (!messages || messages.length === 0) return 0;
  const sum = messages.reduce((total, msg) => total + (msg.Rating || 0), 0);
  return (sum / messages.length).toFixed(1);
}; 