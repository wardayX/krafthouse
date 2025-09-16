import React from 'react';

const InitialsAvatar = ({ 
  name, 
  size = 40, 
  fontSize = 16,
  imageUrl = null,
  style = {},
  className = ''
}) => {
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    
    const parts = name.trim().split(' ').filter(part => part.length > 0);
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    } else if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return 'U';
  };

  // Generate consistent color based on name
  const getAvatarColor = (name) => {
    if (!name) return '#4ecdc4';
    
    const colors = [
      '#4ecdc4', '#45b7d1', '#96c93d', '#f5a623',
      '#e85d75', '#7b68ee', '#ff6b6b', '#26de81',
      '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe',
      '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);

  // If image URL is provided and valid, show image
  if (imageUrl) {
    return (
      <div
        className={`avatar-container ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #e9ecef',
          ...style
        }}
      >
        <img
          src={imageUrl}
          alt={name || 'User'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // If image fails to load, hide it and show initials
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback initials (hidden by default) */}
        <div
          style={{
            display: 'none',
            width: '100%',
            height: '100%',
            backgroundColor,
            color: 'white',
            fontSize: fontSize,
            fontWeight: 'bold',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {initials}
        </div>
      </div>
    );
  }

  // Show initials avatar
  return (
    <div
      className={`avatar-container ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fontSize,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        ...style
      }}
    >
      {initials}
    </div>
  );
};

export default InitialsAvatar;
