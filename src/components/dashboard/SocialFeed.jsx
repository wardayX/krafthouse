import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import InitialsAvatar from '../common/InitialsAvatar';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Real-time listener for community posts
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    console.log('📡 Setting up real-time posts listener...');
    
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(50) // Show latest 50 posts
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log(`📬 Received ${snapshot.docs.length} posts from Firestore`);
          
          const communityPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore timestamp to JavaScript Date
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }));

          setPosts(communityPosts);
          setLoading(false);
          setError('');
          
          console.log('✅ Community posts loaded:', communityPosts);
        },
        (error) => {
          console.error('❌ Error loading posts:', error);
          setError('Failed to load posts: ' + error.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('🔌 Cleaning up posts listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ Error setting up posts listener:', error);
      setError('Failed to set up posts feed');
      setLoading(false);
    }
  }, [currentUser]);

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleLike = (postId) => {
    console.log('👍 Like clicked for post:', postId);
    // TODO: Implement like functionality
  };

  const handleComment = (postId) => {
    console.log('💬 Comment clicked for post:', postId);
    // TODO: Implement comment functionality
  };

  const handleShare = (postId) => {
    console.log('📤 Share clicked for post:', postId);
    // TODO: Implement share functionality
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <h3>Loading Community Feed...</h3>
        <p style={{ color: '#666' }}>Fetching latest posts from artisans</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
        <h3>Error Loading Feed</h3>
        <p style={{ color: '#ff6b6b' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
        <h3>No Posts Yet</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Be the first to share your creation with the community!
        </p>
        <p style={{ color: '#4ecdc4', fontSize: '0.9rem' }}>
          Create a post to see it appear here in real-time
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.8rem' }}>
          🌟 Community Feed
        </h2>
        <p style={{ color: '#666', margin: 0 }}>
          Discover amazing creations from artisans around the world
        </p>
        <div style={{
          backgroundColor: '#e8f8f6',
          color: '#4ecdc4',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          display: 'inline-block',
          marginTop: '0.5rem'
        }}>
          📡 Live: {posts.length} posts
        </div>
      </div>

      {/* Posts Feed */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}
          >
            {/* Post Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: '1px solid #e9ecef'
            }}>
              <InitialsAvatar
                name={post.authorName || 'Unknown'}
                imageUrl={post.authorAvatar}
                size={40}
                fontSize={16}
                style={{ marginRight: '0.75rem' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                  {post.authorName || 'Anonymous Artisan'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {formatTimeAgo(post.createdAt)}
                </div>
              </div>
              {post.authorId === currentUser?.uid && (
                <div style={{
                  backgroundColor: '#e8f8f6',
                  color: '#4ecdc4',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  Your Post
                </div>
              )}
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div style={{ position: 'relative' }}>
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}

            {/* Post Content */}
            <div style={{ padding: '1rem' }}>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {post.title}
              </h3>
              
              {post.description && (
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#666', 
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {post.description}
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#e8f8f6',
                        color: '#4ecdc4',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement Stats */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                color: '#666',
                marginBottom: '1rem'
              }}>
                <span>❤️ {post.likes || 0} likes</span>
                <span>💬 {post.comments || 0} comments</span>
                <span>📤 {post.shares || 0} shares</span>
                <span>👀 {post.views || 0} views</span>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                paddingTop: '1rem',
                borderTop: '1px solid #e9ecef'
              }}>
                <button
                  onClick={() => handleLike(post.id)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ❤️ Like
                </button>
                <button
                  onClick={() => handleComment(post.id)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  💬 Comment
                </button>
                <button
                  onClick={() => handleShare(post.id)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  📤 Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeed;
