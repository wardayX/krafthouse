import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import ProfileSection from './ProfileSection';
import UserSearch from './UserSearch';
import ContentCreator from './ContentCreator';
import AnalyticsSection from './AnalyticsSection';
import SettingsSection from './SettingsSection';
import AIAssistant from '../chatbot/AIAssistant';

const Dashboard = () => {
  const { 
    currentUser, 
    userProfile, 
    profileLoading, 
    logout, 
    saveUserProfile, 
    uploadImage,
    createPost,
    searchUsers,
    getUserPosts,
    likePost,
    commentOnPost,
    sharePost,
    followUser,
    unfollowUser
  } = useAuth();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSearch, setShowSearch] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load user posts when profile is loaded
  const loadUserPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const posts = await getUserPosts();
      setUserPosts(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
    setPostsLoading(false);
  }, [getUserPosts]);

  useEffect(() => {
    if (currentUser && !profileLoading) {
      loadUserPosts();
    }
  }, [currentUser, profileLoading, loadUserPosts]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleProfileUpdate = async (newProfileData) => {
    try {
      console.log('Updating profile with data:', newProfileData);
      const result = await saveUserProfile(newProfileData);
      if (result.success) {
        console.log('✅ Profile updated successfully');
        return { success: true };
      } else {
        console.error('❌ Profile update failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  const handleImageUpload = async (file, type) => {
    try {
      const result = await uploadImage(file, type);
      if (result.success) {
        const updateData = type === 'profile' 
          ? { profileImage: result.data.url }
          : type === 'cover'
            ? { coverImage: result.data.url }
            : {};
        
        await handleProfileUpdate(updateData);
        return result;
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handlePostCreate = async (postData) => {
    try {
      const result = await createPost(postData);
      if (result.success) {
        await loadUserPosts(); // Refresh posts
        return result;
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // AI Assistant Handlers
  const toggleAIAssistant = () => {
    setIsAIAssistantOpen(prev => !prev);
    console.log('🤖 AI Assistant toggled:', !isAIAssistantOpen);
  };

  // Post interaction handlers
  const handleLike = async (postId) => {
    try {
      const result = await likePost(postId);
      if (result.success) {
        await loadUserPosts(); // Refresh posts to show updated likes
      }
      return result;
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, error: error.message };
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      const result = await commentOnPost(postId, comment);
      if (result.success) {
        await loadUserPosts(); // Refresh posts to show new comment
      }
      return result;
    } catch (error) {
      console.error('Error commenting on post:', error);
      return { success: false, error: error.message };
    }
  };

  const handleShare = async (postId) => {
    try {
      const result = await sharePost(postId);
      if (result.success) {
        await loadUserPosts(); // Refresh posts to show updated shares
      }
      return result;
    } catch (error) {
      console.error('Error sharing post:', error);
      return { success: false, error: error.message };
    }
  };

  const handleFollow = async (userId) => {
    try {
      const result = await followUser(userId);
      return result;
    } catch (error) {
      console.error('Error following user:', error);
      return { success: false, error: error.message };
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const result = await unfollowUser(userId);
      return result;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return { success: false, error: error.message };
    }
  };

  const tabs = [
    { id: 'profile', name: 'My Profile', icon: '👤' },
    { id: 'posts', name: 'My Posts', icon: '📷' },
    { id: 'create', name: 'Create Post', icon: '➕' },
    { id: 'search', name: 'Find Artisans', icon: '🔍' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'ai-assistant', name: 'AI Assistant', icon: '🤖' }
  ];

  // Show loading while profile is being loaded
  if (profileLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ 
          width: '60px',
          height: '60px',
          border: '4px solid #4ecdc4',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          marginBottom: '1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h2 style={{ color: '#4ecdc4', marginBottom: '0.5rem' }}>
          Loading Your KraftHouse Dashboard...
        </h2>
        <p style={{ color: '#666', textAlign: 'center' }}>
          Preparing your creative workspace and profile data
        </p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error if user profile failed to load
  if (!userProfile && !profileLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '1rem',
          color: '#ff6b6b'
        }}>❌</div>
        <h2 style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>
          Profile Load Error
        </h2>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '2rem' }}>
          We couldn't load your artisan profile. This might be a network issue.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#4ecdc4',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}
        >
          🔄 Reload Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Enhanced Header */}
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
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {/* Left Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handleBackToHome}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #4ecdc4',
                color: '#4ecdc4',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#4ecdc4';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#4ecdc4';
              }}
            >
              ← Home
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '0px',
                padding: '0px',
                margin: '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.9rem',
                fontWeight: 'bold'
              }}>
                🎨
              </div>
              <h1 style={{ margin: 0, color: '#4ecdc4', fontSize: '1.8rem', fontWeight: 'bold' }}>
                KraftHouse
              </h1>
            </div>
            <div style={{
              backgroundColor: '#e8f8f6',
              color: '#4ecdc4',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              Artisan Dashboard
            </div>
          </div>

          {/* Center Section - Search Bar */}
          <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Search artisans, crafts, or skills..."
                onClick={() => setShowSearch(true)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '25px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4ecdc4';
                  setShowSearch(true);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e9ecef';
                  setTimeout(() => setShowSearch(false), 200);
                }}
              />
              <button
                onClick={() => setActiveTab('search')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: '#4ecdc4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                🔍
              </button>
            </div>

            {/* Quick Search Dropdown */}
            {showSearch && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '12px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                marginTop: '5px',
                padding: '1.5rem',
                zIndex: 1001
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#4ecdc4', fontSize: '1rem' }}>
                    🔥 Quick Search
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Pottery', 'Jewelry', 'Woodworking', 'Textiles', 'Painting', 'Sculpture'].map(craft => (
                      <button
                        key={craft}
                        onClick={() => {
                          setActiveTab('search');
                          setShowSearch(false);
                        }}
                        style={{
                          backgroundColor: '#e8f8f6',
                          color: '#4ecdc4',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '15px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {craft}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                    📋 Recent
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#999' }}>
                    No recent searches
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - User Info & AI Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* AI Assistant Quick Access Button */}
            <button
              onClick={toggleAIAssistant}
              style={{
                backgroundColor: isAIAssistantOpen ? '#ff6b6b' : '#4ecdc4',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
              }}
              title={isAIAssistantOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
            >
              {isAIAssistantOpen ? '✕' : '🤖'}
            </button>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                {userProfile?.displayName || currentUser?.displayName || 'Artisan'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                @{userProfile?.username || 'loading...'}
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              {(userProfile?.profileImage || currentUser?.photoURL) ? (
                <img 
                  src={userProfile?.profileImage || currentUser.photoURL} 
                  alt="Profile" 
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: '3px solid #4ecdc4',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#4ecdc4',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {(userProfile?.displayName || currentUser?.displayName || 'A')[0]}
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '16px',
                height: '16px',
                backgroundColor: '#4ecdc4',
                borderRadius: '50%',
                border: '2px solid white'
              }}></div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ff5252'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ff6b6b'}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Enhanced Sidebar Navigation */}
          <aside style={{
            width: '280px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '2rem',
            height: 'fit-content',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: '120px'
          }}>
            <nav>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'ai-assistant') {
                      toggleAIAssistant();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '1rem 1.25rem',
                    margin: '0.25rem 0',
                    border: 'none',
                    borderRadius: '10px',
                    backgroundColor: (activeTab === tab.id || (tab.id === 'ai-assistant' && isAIAssistantOpen)) ? '#4ecdc4' : 'transparent',
                    color: (activeTab === tab.id || (tab.id === 'ai-assistant' && isAIAssistantOpen)) ? 'white' : '#333',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '1rem',
                    fontWeight: (activeTab === tab.id || (tab.id === 'ai-assistant' && isAIAssistantOpen)) ? 'bold' : 'normal',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    if (activeTab !== tab.id && !(tab.id === 'ai-assistant' && isAIAssistantOpen)) {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.transform = 'translateX(5px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (activeTab !== tab.id && !(tab.id === 'ai-assistant' && isAIAssistantOpen)) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{tab.icon}</span>
                  {tab.name}
                  {tab.id === 'ai-assistant' && (
                    <div style={{
                      marginLeft: 'auto',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isAIAssistantOpen ? '#fff' : '#4ecdc4',
                      opacity: 0.8
                    }}></div>
                  )}
                </button>
              ))}
            </nav>

            {/* Enhanced Quick Stats */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
              borderRadius: '10px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ 
                margin: '0 0 1.5rem 0', 
                color: '#333', 
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}>
                📊 Quick Stats
              </h4>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                <div style={{ 
                  marginBottom: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>📷 Posts:</span>
                  <strong style={{ color: '#4ecdc4' }}>{userPosts.length}</strong>
                </div>
                <div style={{ 
                  marginBottom: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>👥 Followers:</span>
                  <strong style={{ color: '#4ecdc4' }}>{userProfile?.followers || 0}</strong>
                </div>
                <div style={{ 
                  marginBottom: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>👁️ Profile:</span>
                  <strong style={{ color: userProfile?.isPublic ? '#4ecdc4' : '#ff6b6b' }}>
                    {userProfile?.isPublic ? 'Public' : 'Private'}
                  </strong>
                </div>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>⭐ Rating:</span>
                  <strong style={{ color: '#ffa726' }}>
                    {userProfile?.rating || '5.0'}★
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('create')}
                style={{
                  width: '100%',
                  backgroundColor: '#4ecdc4',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#45b7d1';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#4ecdc4';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ➕ Create New Post
              </button>
            </div>
          </aside>

          {/* Enhanced Main Content */}
          <main style={{ flex: 1 }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              minHeight: '600px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              {activeTab === 'profile' && (
                <UserProfile 
                  profileData={userProfile} 
                  currentUser={currentUser}
                  onProfileUpdate={handleProfileUpdate}
                  onImageUpload={handleImageUpload}
                />
              )}
              
              {activeTab === 'posts' && (
                <ProfileSection 
                  profileData={userProfile} 
                  currentUser={currentUser}
                  userPosts={userPosts}
                  postsLoading={postsLoading}
                  onPostCreate={handlePostCreate}
                  onPostsRefresh={loadUserPosts}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              )}

              {activeTab === 'create' && (
                <ContentCreator 
                  currentUser={currentUser}
                  onPostCreate={handlePostCreate}
                  onImageUpload={handleImageUpload}
                />
              )}
              
              {activeTab === 'search' && (
                <UserSearch 
                  currentUser={currentUser}
                  onSearch={searchUsers}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              )}
              
              {activeTab === 'analytics' && (
                <AnalyticsSection 
                  profileData={userProfile}
                  userPosts={userPosts}
                />
              )}
              
              {activeTab === 'settings' && (
                <SettingsSection 
                  profileData={userProfile} 
                  onProfileUpdate={handleProfileUpdate}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* AI Assistant Component - Conditionally rendered */}
      {isAIAssistantOpen && (
        <AIAssistant 
          isOpen={isAIAssistantOpen} 
          onToggle={toggleAIAssistant}
          artisanData={userProfile}
        />
      )}

      {/* Floating AI Assistant Button (Alternative Access) */}
      {!isAIAssistantOpen && (
        <button
          onClick={toggleAIAssistant}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(78, 205, 196, 0.3)',
            zIndex: 999,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 25px rgba(78, 205, 196, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 20px rgba(78, 205, 196, 0.3)';
          }}
          title="Open AI Assistant"
        >
          🤖
        </button>
      )}
    </div>
  );
};

export default Dashboard;
