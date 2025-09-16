import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import InitialsAvatar from '../common/InitialsAvatar';

const ContentCreator = ({ currentUser, onPostCreate }) => {
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [postData, setPostData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const { uploadImage, createPost } = useAuth();

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setMessage('❌ Invalid file type. Please select JPEG, PNG, WebP, or GIF images.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('❌ File too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setMessage('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedFile) {
      setMessage('❌ Please select an image first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    try {
      const result = await uploadImage(
        selectedFile, 
        'posts',
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (result.success) {
        setPostData(prev => ({
          ...prev,
          imageUrl: result.data.url
        }));
        setMessage('✅ Image uploaded successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Upload failed: ' + error.message);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  // Handle post creation
  const handleCreatePost = async () => {
    if (!postData.title.trim()) {
      setMessage('❌ Please provide a title');
      return;
    }

    if (!postData.imageUrl) {
      setMessage('❌ Please upload an image first');
      return;
    }

    setCreating(true);
    setMessage('');

    try {
      const result = await createPost(postData);
      if (result.success) {
        setMessage('✅ Post created successfully!');
        
        // Reset form
        setPostData({
          title: '',
          description: '',
          imageUrl: '',
          tags: []
        });
        setSelectedFile(null);
        setPreviewUrl('');
        setTagInput('');
        
        if (onPostCreate) {
          onPostCreate();
        }
      } else {
        setMessage('❌ Failed to create post: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error creating post: ' + error.message);
    }

    setCreating(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      setPostData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Message Display */}
      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: message.includes('✅') ? '#e8f8f6' : '#fff5f5',
          color: message.includes('✅') ? '#4ecdc4' : '#ff6b6b',
          border: `1px solid ${message.includes('✅') ? '#4ecdc4' : '#ff6b6b'}`,
          marginBottom: '2rem',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Content Creation Form */}
        <div>
          <h2 style={{ 
            margin: '0 0 2rem 0', 
            color: '#333', 
            fontSize: '1.8rem',
            fontWeight: 'bold'
          }}>
            ➕ Create New Post
          </h2>

          {/* Post Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Post Title *
            </label>
            <input
              type="text"
              value={postData.title}
              onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4ecdc4'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              placeholder="What did you create today?"
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Description
            </label>
            <textarea
              value={postData.description}
              onChange={(e) => setPostData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4ecdc4'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              placeholder="Tell the story behind this creation..."
            />
          </div>

          {/* Image Upload Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Upload Image *
            </label>

            {/* File Input */}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="image-upload-input"
            />
            
            <div style={{
              border: '2px dashed #4ecdc4',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: previewUrl ? '#e8f8f6' : '#f8f9fa',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              {previewUrl ? (
                <div>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: '#4ecdc4', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      ✅ Image selected: {selectedFile?.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      Size: {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  
                  {uploading ? (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ 
                        width: '100%', 
                        backgroundColor: '#e9ecef', 
                        borderRadius: '10px',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ 
                          width: `${uploadProgress}%`, 
                          height: '10px', 
                          backgroundColor: '#4ecdc4', 
                          borderRadius: '10px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <div style={{ color: '#4ecdc4', fontSize: '0.9rem' }}>
                        Uploading... {uploadProgress}%
                      </div>
                    </div>
                  ) : postData.imageUrl ? (
                    <div style={{ color: '#4ecdc4', fontWeight: 'bold' }}>
                      ✅ Image uploaded successfully!
                    </div>
                  ) : (
                    <button
                      onClick={handleImageUpload}
                      style={{
                        backgroundColor: '#4ecdc4',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      📤 Upload Image
                    </button>
                  )}
                  
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={() => document.getElementById('image-upload-input').click()}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#4ecdc4',
                        border: '1px solid #4ecdc4',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <div onClick={() => document.getElementById('image-upload-input').click()}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#4ecdc4' }}>
                    📸
                  </div>
                  <h4 style={{ color: '#4ecdc4', margin: '0 0 0.5rem 0' }}>
                    Click to Select Image
                  </h4>
                  <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
                    JPEG, PNG, WebP, or GIF (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Tags
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
                placeholder="Add a tag (e.g., pottery, handmade)"
              />
              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                style={{
                  backgroundColor: tagInput.trim() ? '#4ecdc4' : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: tagInput.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem'
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {postData.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: '#4ecdc4',
                    color: 'white',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: 0
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Publish Button */}
          <button
            onClick={handleCreatePost}
            disabled={creating || uploading || !postData.title.trim() || !postData.imageUrl}
            style={{
              width: '100%',
              backgroundColor: (creating || uploading || !postData.title.trim() || !postData.imageUrl) ? '#ccc' : '#4ecdc4',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: (creating || uploading || !postData.title.trim() || !postData.imageUrl) ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            {creating ? '📤 Publishing...' : '📤 Publish Post'}
          </button>
        </div>

        {/* Preview Section */}
        <div>
          <h3 style={{ 
            margin: '0 0 1.5rem 0', 
            color: '#333', 
            fontSize: '1.4rem',
            fontWeight: 'bold'
          }}>
            👁️ Preview
          </h3>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            {/* Post Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: '1px solid #e9ecef'
            }}>
              <InitialsAvatar
                name={currentUser?.displayName || 'You'}
                imageUrl={currentUser?.photoURL}
                size={40}
                fontSize={16}
                style={{ marginRight: '0.75rem' }}
              />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {currentUser?.displayName || 'You'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  Just now
                </div>
              </div>
            </div>

            {/* Post Image */}
            {postData.imageUrl || previewUrl ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={postData.imageUrl || previewUrl}
                  alt="Post preview"
                  style={{
                    width: '100%',
                    height: '250px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ) : (
              <div style={{
                height: '250px',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '1.1rem'
              }}>
                Upload an image to see preview
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
                {postData.title || 'Your post title will appear here...'}
              </h4>
              
              <p style={{ 
                margin: '0 0 1rem 0', 
                color: '#666', 
                fontSize: '0.9rem',
                lineHeight: '1.4'
              }}>
                {postData.description || 'Your post description will appear here...'}
              </p>

              {postData.tags.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {postData.tags.map((tag) => (
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

              {/* Mock Engagement */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                  <span>🤍 0 likes</span>
                  <span>💬 0 comments</span>
                  <span>📤 0 shares</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      color: '#666',
                      border: '1px solid #ddd',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    🤍 Like
                  </button>
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      color: '#666',
                      border: '1px solid #ddd',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    💬 Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Tips */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#e8f8f6',
            borderRadius: '8px',
            border: '1px solid #4ecdc4'
          }}>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              color: '#4ecdc4', 
              fontSize: '1rem' 
            }}>
              💡 Upload Tips
            </h4>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1.25rem', 
              color: '#666', 
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
              <li>Use high-quality images (JPEG, PNG, WebP)</li>
              <li>Keep file size under 10MB</li>
              <li>Good lighting makes better photos</li>
              <li>Tell your craft's story in the description</li>
              <li>Add relevant tags to reach more people</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreator;
