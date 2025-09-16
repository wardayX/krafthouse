import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  runTransaction, 
  addDoc, 
  serverTimestamp, 
  where, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import InitialsAvatar from './common/InitialsAvatar';

const Home = () => {
  const { currentUser, userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [likingPosts, setLikingPosts] = useState(new Set());

  // Fetch posts for social feed
  useEffect(() => {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(30));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      setPosts(feedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch comments for a specific post
  const fetchComments = (postId) => {
    if (comments[postId]) return; // Already fetched

    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef, 
      where('postId', '==', postId), 
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      setComments(prev => ({
        ...prev,
        [postId]: postComments
      }));
    });

    return unsubscribe;
  };

  // Handle like/unlike with proper atomic updates - FIXED
  const handleLike = async (postId) => {
    if (!currentUser || likingPosts.has(postId)) return;
    
    setLikingPosts(prev => new Set([...prev, postId]));

    try {
      const postRef = doc(db, 'posts', postId);
      
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        
        if (!postDoc.exists()) {
          throw new Error('Post does not exist');
        }

        const postData = postDoc.data();
        let currentLikes = postData.likes || 0;
        let likedBy = postData.likedBy || [];
        
        // FIXED: Properly declare userHasLiked within the transaction scope
        const userHasLiked = likedBy.includes(currentUser.uid);
        
        if (userHasLiked) {
          // Unlike: Remove user from likedBy array and decrease count
          likedBy = likedBy.filter(uid => uid !== currentUser.uid);
          currentLikes = Math.max(0, currentLikes - 1); // Prevent negative
        } else {
          // Like: Add user to likedBy array and increase count
          likedBy.push(currentUser.uid);
          currentLikes = currentLikes + 1;
        }

        transaction.update(postRef, {
          likes: currentLikes,
          likedBy: likedBy
        });
      });

      console.log('✅ Post like updated successfully');
    } catch (error) {
      console.error('❌ Error updating like:', error);
    }

    setLikingPosts(prev => {
      const newSet = new Set(prev);
      newSet.delete(postId);
      return newSet;
    });
  };

  // Handle comment submission
  const handleComment = async (postId) => {
    const commentText = commentTexts[postId];
    if (!currentUser || !commentText?.trim()) return;

    try {
      // Add comment to comments collection
      await addDoc(collection(db, 'comments'), {
        postId: postId,
        content: commentText.trim(),
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.displayName || 'Anonymous',
        authorAvatar: userProfile?.profileImage || currentUser.photoURL || '',
        createdAt: serverTimestamp()
      });

      // Update post comment count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: increment(1)
      });

      // Clear comment text
      setCommentTexts(prev => ({
        ...prev,
        [postId]: ''
      }));

      console.log('✅ Comment added successfully');
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    }
  };

  // Toggle comments visibility
  const toggleComments = (postId) => {
    const isVisible = showComments[postId];
    
    setShowComments(prev => ({
      ...prev,
      [postId]: !isVisible
    }));

    // Fetch comments if showing for the first time
    if (!isVisible && !comments[postId]) {
      fetchComments(postId);
    }
  };

  // Handle share (copy URL to clipboard)
  const handleShare = async (postId, title) => {
    try {
      const postURL = `${window.location.origin}/post/${postId}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(postURL);
        alert(`"${title}" link copied to clipboard!`);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = postURL;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert(`"${title}" link copied to clipboard!`);
      }

      // Update share count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        shares: increment(1)
      });

      console.log('✅ Post shared successfully');
    } catch (error) {
      console.error('❌ Error sharing post:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // For non-authenticated users, show welcome page
  if (!currentUser) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa' 
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>Welcome to KraftHouse</h2>
          <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Discover amazing artisan creations and join our creative community!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link 
              to="/signup"
              style={{
                backgroundColor: '#4ecdc4',
                color: 'white',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            >
              Join Community
            </Link>
            <Link 
              to="/login"
              style={{
                backgroundColor: 'transparent',
                color: '#4ecdc4',
                border: '2px solid #4ecdc4',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ margin: 0, color: '#4ecdc4', fontSize: '1.8rem', fontWeight: 'bold' }}>
            🎨 KraftHouse
            </h1>
            <div style={{
              backgroundColor: '#e8f8f6',
              color: '#4ecdc4',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              Community Feed
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              👋 {userProfile?.displayName || 'Artisan'}
            </span>
            <Link 
              to="/dashboard" 
              style={{ 
                backgroundColor: '#4ecdc4',
                color: 'white',
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              🚀 Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Social Feed */}
      <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1rem',
              animation: 'spin 2s linear infinite'
            }}>
              🎨
            </div>
            <h3>Loading community feed...</h3>
            <p style={{ color: '#666' }}>Discovering amazing artisan creations</p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
            <h3>No posts yet</h3>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Be the first to share your amazing work with the community!
            </p>
            <Link 
              to="/dashboard"
              style={{
                backgroundColor: '#4ecdc4',
                color: 'white',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold'
              }}
            >
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {posts.map((post) => (
              <article
                key={post.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Post Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <InitialsAvatar
                    name={post.authorName || 'Artist'}
                    imageUrl={post.authorAvatar}
                    size={45}
                    fontSize={18}
                    style={{ marginRight: '1rem' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      {post.authorName || 'Anonymous Artist'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {formatTimeAgo(post.createdAt)} • {post.craftType || 'Artisan'}
                    </div>
                  </div>
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    style={{
                      width: '100%',
                      maxHeight: '500px',
                      objectFit: 'cover'
                    }}
                  />
                )}

                {/* Post Content */}
                <div style={{ padding: '1.5rem' }}>
                  <h2 style={{ 
                    margin: '0 0 0.75rem 0', 
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {post.title}
                  </h2>
                  
                  {post.description && (
                    <p style={{ 
                      margin: '0 0 1rem 0', 
                      color: '#666', 
                      fontSize: '1rem',
                      lineHeight: '1.6'
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
                            padding: '0.25rem 0.75rem',
                            borderRadius: '15px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Engagement Section */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f0f0f0',
                    marginBottom: showComments[post.id] ? '1rem' : '0'
                  }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <button
                        onClick={() => handleLike(post.id)}
                        disabled={likingPosts.has(post.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: likingPosts.has(post.id) ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem',
                          color: post.likedBy?.includes(currentUser?.uid) ? '#ff6b6b' : '#666',
                          fontWeight: post.likedBy?.includes(currentUser?.uid) ? 'bold' : 'normal',
                          opacity: likingPosts.has(post.id) ? 0.6 : 1
                        }}
                      >
                        ❤️ {post.likes || 0}
                      </button>
                      
                      <button
                        onClick={() => toggleComments(post.id)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem',
                          color: showComments[post.id] ? '#4ecdc4' : '#666',
                          fontWeight: showComments[post.id] ? 'bold' : 'normal'
                        }}
                      >
                        💬 {post.comments || 0}
                      </button>
                      
                      <button
                        onClick={() => handleShare(post.id, post.title)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem',
                          color: '#666'
                        }}
                      >
                        📤 {post.shares || 0}
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div style={{ 
                      paddingTop: '1rem', 
                      borderTop: '1px solid #f0f0f0',
                      marginTop: '1rem'
                    }}>
                      {/* Comment Input */}
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <InitialsAvatar
                          name={userProfile?.displayName || currentUser?.displayName || 'You'}
                          imageUrl={userProfile?.profileImage || currentUser?.photoURL}
                          size={32}
                          fontSize={14}
                        />
                        <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            value={commentTexts[post.id] || ''}
                            onChange={(e) => setCommentTexts(prev => ({ 
                              ...prev, 
                              [post.id]: e.target.value 
                            }))}
                            placeholder="Add a comment..."
                            style={{
                              flex: 1,
                              padding: '0.5rem 1rem',
                              border: '1px solid #e0e0e0',
                              borderRadius: '20px',
                              fontSize: '0.9rem',
                              outline: 'none'
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleComment(post.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            disabled={!commentTexts[post.id]?.trim()}
                            style={{
                              backgroundColor: commentTexts[post.id]?.trim() ? '#4ecdc4' : '#ccc',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '35px',
                              height: '35px',
                              cursor: commentTexts[post.id]?.trim() ? 'pointer' : 'not-allowed',
                              fontSize: '16px'
                            }}
                          >
                            🚀
                          </button>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {comments[post.id] && comments[post.id].length > 0 ? (
                          comments[post.id].map((comment) => (
                            <div 
                              key={comment.id} 
                              style={{ 
                                display: 'flex', 
                                gap: '0.75rem', 
                                marginBottom: '1rem',
                                padding: '0.5rem 0'
                              }}
                            >
                              <InitialsAvatar
                                name={comment.authorName || 'Anonymous'}
                                imageUrl={comment.authorAvatar}
                                size={32}
                                fontSize={14}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ 
                                  backgroundColor: '#f8f9fa', 
                                  padding: '0.75rem 1rem', 
                                  borderRadius: '18px',
                                  marginBottom: '0.25rem'
                                }}>
                                  <div style={{ 
                                    fontWeight: 'bold', 
                                    fontSize: '0.85rem', 
                                    marginBottom: '0.25rem',
                                    color: '#333'
                                  }}>
                                    {comment.authorName || 'Anonymous'}
                                  </div>
                                  <div style={{ fontSize: '0.9rem', color: '#333' }}>
                                    {comment.content}
                                  </div>
                                </div>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  color: '#999', 
                                  paddingLeft: '1rem' 
                                }}>
                                  {formatTimeAgo(comment.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ 
                            textAlign: 'center', 
                            color: '#666', 
                            fontSize: '0.9rem',
                            padding: '1rem'
                          }}>
                            No comments yet. Be the first to comment!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
