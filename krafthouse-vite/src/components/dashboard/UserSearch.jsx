import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import InitialsAvatar from '../common/InitialsAvatar';

const UserSearch = ({ currentUser, onSearch, onFollow, onUnfollow, onLike, onComment, onShare }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState({});
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});

  const { getUserPosts, checkIfFollowing } = useAuth();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const results = await onSearch(searchTerm);
      setSearchResults(results);
      
      // Check following status for each user
      const statusPromises = results.map(async (user) => {
        const isFollowing = await checkIfFollowing(user.id);
        return { userId: user.id, isFollowing };
      });
      
      const statuses = await Promise.all(statusPromises);
      const statusMap = {};
      statuses.forEach(({ userId, isFollowing }) => {
        statusMap[userId] = isFollowing;
      });
      setFollowingStatus(statusMap);
      
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setLoading(false);
  };

  const handleViewProfile = async (user) => {
    setSelectedUser(user);
    setPostsLoading(true);
    
    try {
      const posts = await getUserPosts(user.id);
      setUserPosts(posts);
    } catch (error) {
      console.error('Error loading user posts:', error);
      setUserPosts([]);
    }
    setPostsLoading(false);
  };

  const handleFollow = async (userId) => {
    try {
      const result = await onFollow(userId);
      if (result.success) {
        setFollowingStatus(prev => ({ ...prev, [userId]: true }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const result = await onUnfollow(userId);
      if (result.success) {
        setFollowingStatus(prev => ({ ...prev, [userId]: false }));
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await onLike(postId);
      // Refresh posts to show updated likes
      if (selectedUser) {
        const updatedPosts = await getUserPosts(selectedUser.id);
        setUserPosts(updatedPosts);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    const comment = commentText[postId];
    if (!comment?.trim()) return;
    
    try {
      await onComment(postId, comment);
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      // Refresh posts to show new comment
      if (selectedUser) {
        const updatedPosts = await getUserPosts(selectedUser.id);
        setUserPosts(updatedPosts);
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
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

  if (selectedUser) {
    return (
      <div style={{ padding: '2rem' }}>
        {/* Back Button */}
        <button
          onClick={() => setSelectedUser(null)}
          style={{
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '2rem'
          }}
        >
          ← Back to Search
        </button>

        {/* User Profile Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          padding: '2rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <InitialsAvatar
            name={selectedUser.displayName}
            imageUrl={selectedUser.profileImage}
            size={80}
            fontSize={32}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
              {selectedUser.displayName}
            </h2>
            <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '1.1rem' }}>
              @{selectedUser.username}
            </p>
            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
              🎨 {selectedUser.craftType} • 📍 {selectedUser.location || 'Unknown'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <span>👥 {selectedUser.followers || 0} followers</span>
              <span>📷 {selectedUser.postsCount || 0} posts</span>
            </div>
          </div>
          {selectedUser.id !== currentUser?.uid && (
            <button
              onClick={() => followingStatus[selectedUser.id] ? handleUnfollow(selectedUser.id) : handleFollow(selectedUser.id)}
              style={{
                backgroundColor: followingStatus[selectedUser.id] ? '#ff6b6b' : '#4ecdc4',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {followingStatus[selectedUser.id] ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        {/* User Posts */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            📷 {selectedUser.displayName}'s Posts
          </h3>
          
          {postsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
              <p>Loading posts...</p>
            </div>
          ) : userPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>
                {selectedUser.displayName} hasn't shared any posts yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {userPosts.map((post) => (
                <div
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
                  {/* Post Image */}
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                    />
                  )}

                  {/* Post Content */}
                  <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.2rem' }}>
                      {post.title}
                    </h4>
                    
                    {post.description && (
                      <p style={{ 
                        margin: '0 0 1rem 0', 
                        color: '#666', 
                        fontSize: '0.9rem',
                        lineHeight: '1.4'
                      }}>
                        {post.description.length > 100 
                          ? `${post.description.substring(0, 100)}...`
                          : post.description
                        }
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
                              padding: '0.25rem 0.5rem',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Meta */}
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#999', 
                      marginBottom: '1rem' 
                    }}>
                      {formatTimeAgo(post.createdAt)}
                    </div>

                    {/* Post Actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={() => handleLike(post.id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            color: post.likedBy?.includes(currentUser?.uid) ? '#ff6b6b' : '#666'
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
                            color: '#666'
                          }}
                        >
                          💬 {post.comments || 0}
                        </button>
                        <button
                          onClick={() => onShare(post.id)}
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
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>
                        👀 {post.views || 0}
                      </span>
                    </div>

                    {/* Comment Section */}
                    {showComments[post.id] && (
                      <div style={{ 
                        marginTop: '1rem', 
                        paddingTop: '1rem', 
                        borderTop: '1px solid #f0f0f0' 
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                          <input
                            type="text"
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText(prev => ({ 
                              ...prev, 
                              [post.id]: e.target.value 
                            }))}
                            placeholder="Add a comment..."
                            style={{
                              flex: 1,
                              padding: '0.5rem',
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
                            style={{
                              backgroundColor: '#4ecdc4',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '35px',
                              height: '35px',
                              cursor: 'pointer',
                              fontSize: '16px'
                            }}
                          >
                            🚀
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>🔍 Find Artisans</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Discover talented artisans, follow their work, and get inspired by their creations.
        </p>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, username, or craft type..."
            style={{
              flex: 1,
              padding: '1rem',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#4ecdc4',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳' : '🔍'} Search
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>
            Search Results ({searchResults.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {searchResults.map((user) => (
              <div
                key={user.id}
                style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <InitialsAvatar
                    name={user.displayName}
                    imageUrl={user.profileImage}
                    size={60}
                    fontSize={24}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>
                      {user.displayName}
                    </h4>
                    <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                      @{user.username}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                    🎨 {user.craftType} • 📍 {user.location || 'Unknown'}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#999' }}>
                    <span>👥 {user.followers || 0} followers</span>
                    <span>📷 {user.postsCount || 0} posts</span>
                  </div>
                </div>

                {user.bio && (
                  <p style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#666', 
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {user.bio.length > 80 
                      ? `${user.bio.substring(0, 80)}...`
                      : user.bio
                    }
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleViewProfile(user)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#4ecdc4',
                      border: '2px solid #4ecdc4',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      flex: 1
                    }}
                  >
                    View Profile
                  </button>
                  
                  {user.id !== currentUser?.uid && (
                    <button
                      onClick={() => followingStatus[user.id] ? handleUnfollow(user.id) : handleFollow(user.id)}
                      style={{
                        backgroundColor: followingStatus[user.id] ? '#ff6b6b' : '#4ecdc4',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {followingStatus[user.id] ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchTerm && !loading && searchResults.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3>No artisans found</h3>
          <p style={{ color: '#666' }}>
            Try searching with different keywords or browse by craft type.
          </p>
        </div>
      )}

      {/* Popular Craft Types */}
      {!searchTerm && (
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>🔥 Popular Craft Types</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {['Pottery', 'Jewelry', 'Woodworking', 'Textiles', 'Painting', 'Sculpture', 'Ceramics', 'Leatherwork'].map(craft => (
              <button
                key={craft}
                onClick={() => {
                  setSearchTerm(craft);
                  handleSearch();
                }}
                style={{
                  backgroundColor: '#e8f8f6',
                  color: '#4ecdc4',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#4ecdc4';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#e8f8f6';
                  e.target.style.color = '#4ecdc4';
                }}
              >
                {craft}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
