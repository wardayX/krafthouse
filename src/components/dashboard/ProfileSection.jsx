import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import InitialsAvatar from '../common/InitialsAvatar';

const ProfileSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  
  const { currentUser, userProfile } = useAuth();

  // Fetch user's posts in real-time
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    console.log('📡 Loading posts for ProfileSection:', currentUser.uid);
    
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('authorId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log(`📬 ProfileSection: Found ${snapshot.docs.length} posts`);
          
          const userPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }));

          setPosts(userPosts);
          setLoading(false);
          setError('');
          
          console.log('✅ ProfileSection posts loaded:', userPosts);
        },
        (error) => {
          console.error('❌ ProfileSection error loading posts:', error);
          
          if (error.code === 'failed-precondition' && error.message.includes('index')) {
            setError('⏳ Index is still building. Your posts will appear shortly...');
          } else {
            setError('Failed to load posts: ' + error.message);
          }
          
          setLoading(false);
        }
      );

      return () => {
        console.log('🔌 Cleaning up ProfileSection posts listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ ProfileSection error setting up posts listener:', error);
      setError('Failed to set up posts feed');
      setLoading(false);
    }
  }, [currentUser?.uid]);

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleDeletePost = async (postId, postTitle) => {
    const confirmMessage = `Are you sure you want to delete "${postTitle}"?\n\nThis action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleting(postId);
    
    try {
      console.log('🗑️ ProfileSection deleting post:', postId);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'posts', postId));
      
      console.log('✅ ProfileSection post deleted successfully');
      
    } catch (error) {
      console.error('❌ ProfileSection error deleting post:', error);
      alert('Error deleting post: ' + error.message);
    }
    
    setDeleting(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <h3>Loading Your Posts...</h3>
        <p style={{ color: '#666' }}>Fetching your latest creations</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.8rem' }}>
            📷 My Posts & Creations
          </h2>
          <p style={{ margin: 0, color: '#666' }}>
            Manage and showcase your artistic journey
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            backgroundColor: '#e8f8f6',
            color: '#4ecdc4',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            📊 {posts.length} posts
          </div>
          
          {/* Create Post Button */}
          <button
            onClick={() => window.location.hash = '#/dashboard/create'}
            style={{
              backgroundColor: '#4ecdc4',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ➕ Create Post
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</p>
          {error.includes('Index') && (
            <p style={{ color: '#4ecdc4', fontSize: '0.9rem' }}>
              This usually takes 2-5 minutes. Your posts will appear automatically once ready.
            </p>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {posts.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>No Posts Yet</h3>
          <p style={{ margin: '0 0 1.5rem 0' }}>
            Share your first creation with the community!
          </p>
          <button
            onClick={() => window.location.hash = '#/dashboard/create'}
            style={{
              backgroundColor: '#4ecdc4',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Post Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderBottom: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <InitialsAvatar
                    name={userProfile?.displayName || post.authorName || 'You'}
                    imageUrl={userProfile?.profileImage || post.authorAvatar}
                    size={40}
                    fontSize={16}
                    style={{ marginRight: '0.75rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {userProfile?.displayName || post.authorName || 'You'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {formatTimeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDeletePost(post.id, post.title)}
                  disabled={deleting === post.id}
                  style={{
                    backgroundColor: deleting === post.id ? '#ccc' : '#ff4757',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: deleting === post.id ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    opacity: deleting === post.id ? 0.7 : 1
                  }}
                >
                  {deleting === post.id ? '⏳' : '🗑️'}
                </button>
              </div>

              {/* Post Image */}
              {post.imageUrl && (
                <div>
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}

              {/* Post Content */}
              <div style={{ padding: '1rem' }}>
                <h4 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  {post.title}
                </h4>
                
                {post.description && (
                  <p style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#666', 
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
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
                    {post.tags.slice(0, 3).map((tag) => (
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
                    {post.tags.length > 3 && (
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Post Stats */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  color: '#666',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span>❤️ {post.likes || 0}</span>
                    <span>💬 {post.comments || 0}</span>
                    <span>📤 {post.shares || 0}</span>
                  </div>
                  <span>👀 {post.views || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
