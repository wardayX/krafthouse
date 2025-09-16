import React from 'react';

const SettingsSection = ({ profileData, setProfileData }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: 0, color: '#333', fontSize: '1.8rem', marginBottom: '2rem' }}>
        ⚙️ Settings
      </h2>
      <p style={{ color: '#666' }}>Settings panel coming soon!</p>
    </div>
  );
};

export default SettingsSection;
