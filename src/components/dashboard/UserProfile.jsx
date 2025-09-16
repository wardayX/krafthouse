import React, { useState, useRef } from 'react';
import InitialsAvatar from '../common/InitialsAvatar';

const UserProfile = ({ profileData, currentUser, onProfileUpdate, onImageUpload }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState({ profile: false, cover: false });
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState({});
  const profileImageRef = useRef(null);
  const coverImageRef = useRef(null);

  // Initialize edit data when editing starts
  const startEditing = () => {
    setEditData({
      displayName: profileData?.displayName || '',
      username: profileData?.username || '',
      bio: profileData?.bio || '',
      location: profileData?.location || '',
      experience: profileData?.experience || 'Beginner',
      craftType: profileData?.craftType || 'General',
      skills: profileData?.skills || [],
      phone: profileData?.phone || '',
      website: profileData?.website || ''
    });
    setIsEditing(true);
    setErrors({});
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
    setErrors({});
    setNewSkill('');
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle skills management
  const addSkill = () => {
    if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!editData.displayName?.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!editData.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (editData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(editData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (editData.website && !editData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await onProfileUpdate(editData);
      if (result.success) {
        setIsEditing(false);
        setEditData({});
        setNewSkill('');
        console.log('✅ Profile updated successfully');
      } else {
        setErrors({ general: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ general: 'An unexpected error occurred' });
    }
  };

  const handleImageUpload = async (file, type) => {
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const result = await onImageUpload(file, type);
      if (result.success) {
        console.log(`✅ ${type} image uploaded successfully`);
      } else {
        console.error(`❌ ${type} image upload failed:`, result.error);
      }
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
    }
    setUploading(prev => ({ ...prev, [type]: false }));
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      handleImageUpload(file, type);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', minHeight: '600px' }}>
      {/* Cover Photo Section */}
      <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
        {/* Cover Image */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: profileData?.coverImage 
              ? `url(${profileData.coverImage})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
          }}
        >
          {/* Gradient Overlay for better text readability */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.4))'
          }} />

          {/* Cover Photo Upload Button */}
          {currentUser?.uid === profileData?.uid && (
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <input
                type="file"
                ref={coverImageRef}
                onChange={(e) => handleFileSelect(e, 'cover')}
                style={{ display: 'none' }}
                accept="image/*"
              />
              <button
                onClick={() => coverImageRef.current?.click()}
                disabled={uploading.cover}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: uploading.cover ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {uploading.cover ? '⏳' : '📷'} 
                {uploading.cover ? 'Uploading...' : 'Change Cover'}
              </button>
            </div>
          )}

          {/* Profile Info Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '20px',
            zIndex: 2
          }}>
            {/* Profile Picture */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '120px',
                height: '120px',
                border: '4px solid white',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}>
                {profileData?.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <InitialsAvatar
                    name={profileData?.displayName || 'User'}
                    size={112}
                    fontSize={36}
                    style={{ width: '100%', height: '100%', borderRadius: 0 }}
                  />
                )}
              </div>

              {/* Profile Picture Upload Button */}
              {currentUser?.uid === profileData?.uid && (
                <>
                  <input
                    type="file"
                    ref={profileImageRef}
                    onChange={(e) => handleFileSelect(e, 'profile')}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <button
                    onClick={() => profileImageRef.current?.click()}
                    disabled={uploading.profile}
                    style={{
                      position: 'absolute',
                      bottom: '5px',
                      right: '5px',
                      backgroundColor: '#4ecdc4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      cursor: uploading.profile ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                    title="Change profile picture"
                  >
                    {uploading.profile ? '⏳' : '📷'}
                  </button>
                </>
              )}
            </div>

            {/* User Info */}
            <div style={{ flex: 1, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              <h1 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '2.5rem', 
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}>
                {profileData?.displayName || 'Artisan'}
              </h1>
              
              <div style={{ 
                fontSize: '1.2rem', 
                opacity: 0.9,
                marginBottom: '0.5rem'
              }}>
                @{profileData?.username || 'username'}
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '1rem',
                opacity: 0.8,
                flexWrap: 'wrap'
              }}>
                <span>🎨 {profileData?.craftType || 'General Artisan'}</span>
                <span>📍 {profileData?.location || 'Unknown'}</span>
                <span>⭐ {profileData?.experience || 'Beginner'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div style={{ padding: '2rem' }}>
        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ color: '#666' }}>
              👥 <strong>{profileData?.followers || 0}</strong> followers
            </span>
            <span style={{ color: '#666' }}>
              🔗 <strong>{profileData?.following || 0}</strong> following
            </span>
            <span style={{ color: '#666' }}>
              📷 <strong>{profileData?.postsCount || 0}</strong> posts
            </span>
          </div>

          {currentUser?.uid === profileData?.uid && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    style={{
                      backgroundColor: '#4ecdc4',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={cancelEditing}
                    style={{
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ❌ Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={startEditing}
                  style={{
                    backgroundColor: '#4ecdc4',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error Messages */}
        {errors.general && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            {errors.general}
          </div>
        )}

        {isEditing ? (
          /* EDIT MODE */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Basic Info Section */}
            <div>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '1.5rem',
                fontSize: '1.3rem',
                fontWeight: 'bold'
              }}>
                📝 Basic Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Display Name */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    color: '#333' 
                  }}>
                    Display Name *
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={editData.displayName || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: errors.displayName ? '2px solid #ff6b6b' : '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  {errors.displayName && (
                    <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                      {errors.displayName}
                    </span>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    color: '#333' 
                  }}>
                    Username (@) *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={editData.username || ''}
                    onChange={handleInputChange}
                    placeholder="username"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: errors.username ? '2px solid #ff6b6b' : '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                  {errors.username && (
                    <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                      {errors.username}
                    </span>
                  )}
                </div>

                {/* Craft Type */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    color: '#333' 
                  }}>
                    Craft Type
                  </label>
                  <select
                    name="craftType"
                    value={editData.craftType || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="General">General</option>
                    <option value="Pottery">Pottery</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Woodworking">Woodworking</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Painting">Painting</option>
                    <option value="Sculpture">Sculpture</option>
                    <option value="Ceramics">Ceramics</option>
                    <option value="Leatherwork">Leatherwork</option>
                    <option value="Metalwork">Metalwork</option>
                    <option value="Glasswork">Glasswork</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    color: '#333' 
                  }}>
                    Experience Level
                  </label>
                  <select
                    name="experience"
                    value={editData.experience || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="Beginner">Beginner (0-1 years)</option>
                    <option value="Intermediate">Intermediate (2-5 years)</option>
                    <option value="Advanced">Advanced (5-10 years)</option>
                    <option value="Expert">Expert (10+ years)</option>
                    <option value="Master">Master Craftsperson</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '1.5rem',
                fontSize: '1.3rem',
                fontWeight: 'bold'
              }}>
                📍 Location & Contact
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Location */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    color: '#333' 
                  }}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={editData.location || ''}
                    onChange={handleInputChange}
                    placeholder="City, State, Country"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    color: '#333' 
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone || ''}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Website */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: 'bold', 
                  color: '#333' 
                }}>
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={editData.website || ''}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: errors.website ? '2px solid #ff6b6b' : '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                {errors.website && (
                  <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                    {errors.website}
                  </span>
                )}
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '1.5rem',
                fontSize: '1.3rem',
                fontWeight: 'bold'
              }}>
                📖 About You
              </h3>
              
              <textarea
                name="bio"
                value={editData.bio || ''}
                onChange={handleInputChange}
                placeholder="Tell us about yourself, your craft, and your journey as an artisan..."
                rows="5"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Skills Section */}
            <div>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '1.5rem',
                fontSize: '1.3rem',
                fontWeight: 'bold'
              }}>
                🛠️ Skills & Techniques
              </h3>
              
              {/* Current Skills */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem', 
                  marginBottom: '1rem' 
                }}>
                  {editData.skills?.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#4ecdc4',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        style={{
                          background: 'rgba(255,255,255,0.3)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Add New Skill */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: 'bold', 
                    color: '#333' 
                  }}>
                    Add New Skill
                  </label>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="e.g., Hand Carving, Color Theory, Glazing..."
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <button
                  onClick={addSkill}
                  disabled={!newSkill.trim()}
                  style={{
                    backgroundColor: newSkill.trim() ? '#4ecdc4' : '#ccc',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    cursor: newSkill.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  ➕ Add
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                Press Enter or click Add to add a skill. Click the × to remove skills.
              </p>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <>
            {/* Bio Section */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '1rem',
                fontSize: '1.3rem',
                fontWeight: 'bold'
              }}>
                📖 About
              </h3>
              
              <p style={{ 
                color: '#666', 
                fontSize: '1.1rem',
                lineHeight: '1.6',
                margin: 0
              }}>
                {profileData?.bio || 'This artisan hasn\'t added a bio yet.'}
              </p>
            </div>

            {/* Skills Section */}
            {profileData?.skills && profileData.skills.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '1rem',
                  fontSize: '1.3rem',
                  fontWeight: 'bold'
                }}>
                  🛠️ Skills & Techniques
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#e8f8f6',
                        color: '#4ecdc4',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '1rem',
                fontSize: '1.3rem',
                fontWeight: 'bold'
              }}>
                📞 Contact Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#666' }}>
                <div>📧 {profileData?.email || currentUser?.email}</div>
                {profileData?.phone && <div>📱 {profileData.phone}</div>}
                {profileData?.website && (
                  <div>
                    🌐 <a 
                        href={profileData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#4ecdc4', textDecoration: 'none' }}
                      >
                        {profileData.website}
                      </a>
                  </div>
                )}
                <div>📅 Joined {new Date(profileData?.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
