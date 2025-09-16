import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Save, Edit } from '@mui/icons-material';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const ProfileManager = ({ artisanData, onUpdate }) => {
  const { currentUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: artisanData?.name || '',
    username: artisanData?.username || '',
    craftType: artisanData?.craftType || '',
    region: artisanData?.region || '',
    bio: artisanData?.bio || '',
    aboutMe: artisanData?.aboutMe || '',
    location: artisanData?.location || '',
    experience: artisanData?.experience || '',
    contact: {
      phone: artisanData?.contact?.phone || '',
      website: artisanData?.contact?.website || '',
      social: {
        instagram: artisanData?.contact?.social?.instagram || '',
        facebook: artisanData?.contact?.social?.facebook || '',
        twitter: artisanData?.contact?.social?.twitter || ''
      }
    }
  });

  const craftTypes = [
    'Pottery', 'Jewelry Making', 'Textile Arts', 'Woodworking', 'Metalwork',
    'Painting', 'Sculpture', 'Glasswork', 'Leather Craft', 'Ceramics',
    'Embroidery', 'Weaving', 'Carving', 'Beadwork', 'Calligraphy', 'General Craft'
  ];

  const experienceLevels = [
    'Beginner', '1-2 years', '3-5 years', '6-10 years', '10+ years', 'Master Craftsperson'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child, subchild] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          ...(subchild ? {
            [child]: {
              ...prev[parent][child],
              [subchild]: value
            }
          } : {
            [child]: value
          })
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadResult = await apiService.uploadImage(file, currentUser.uid, type);
      if (uploadResult.success) {
        const updateData = type === 'profile' 
          ? { profileImage: uploadResult.data.url }
          : { coverImage: uploadResult.data.url };
        
        const result = await apiService.updateArtisanProfile(currentUser.uid, updateData);
        if (result.success) {
          onUpdate({ ...artisanData, ...updateData });
          setMessage('Image uploaded successfully!');
        }
      }
    } catch (error) {
      setMessage('Error uploading image: ' + error.message);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const result = await apiService.updateArtisanProfile(currentUser.uid, formData);
      if (result.success) {
        onUpdate({ ...artisanData, ...formData });
        setEditMode(false);
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    }
    
    setSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      name: artisanData?.name || '',
      username: artisanData?.username || '',
      craftType: artisanData?.craftType || '',
      region: artisanData?.region || '',
      bio: artisanData?.bio || '',
      aboutMe: artisanData?.aboutMe || '',
      location: artisanData?.location || '',
      experience: artisanData?.experience || '',
      contact: {
        phone: artisanData?.contact?.phone || '',
        website: artisanData?.contact?.website || '',
        social: {
          instagram: artisanData?.contact?.social?.instagram || '',
          facebook: artisanData?.contact?.social?.facebook || '',
          twitter: artisanData?.contact?.social?.twitter || ''
        }
      }
    });
    setEditMode(false);
    setMessage('');
  };

  return (
    <Grid container spacing={3}>
      {message && (
        <Grid item xs={12}>
          <Alert severity={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </Grid>
      )}

      {/* Profile Header */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative', mr: 3 }}>
              <Avatar
                src={artisanData?.profileImage}
                sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}
              >
                {artisanData?.name?.charAt(0)}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-image-upload"
                type="file"
                onChange={(e) => handleImageUpload(e, 'profile')}
              />
              <label htmlFor="profile-image-upload">
                <Button
                  component="span"
                  size="small"
                  sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0,
                    minWidth: 'auto',
                    p: 1,
                    borderRadius: '50%'
                  }}
                  disabled={uploading}
                >
                  {uploading ? <CircularProgress size={16} /> : <PhotoCamera fontSize="small" />}
                </Button>
              </label>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>
                {artisanData?.name || 'Your Name'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip label={artisanData?.craftType || 'Craft Type'} color="primary" />
                <Chip label={artisanData?.region || 'Location'} variant="outlined" />
              </Box>
              <Typography color="text.secondary">
                @{artisanData?.username || 'username'}
              </Typography>
            </Box>

            <Button
              variant={editMode ? "outlined" : "contained"}
              startIcon={editMode ? <Save /> : <Edit />}
              onClick={editMode ? handleSave : () => setEditMode(true)}
              disabled={saving}
              sx={{ ml: 2 }}
            >
              {saving ? <CircularProgress size={20} /> : (editMode ? 'Save Changes' : 'Edit Profile')}
            </Button>
            
            {editMode && (
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ ml: 1 }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* Profile Form */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          
          <TextField
            fullWidth
            label="Display Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!editMode}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            disabled={!editMode}
            margin="normal"
            helperText="This will be your unique identifier"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Craft Type</InputLabel>
            <Select
              value={formData.craftType}
              label="Craft Type"
              onChange={(e) => handleInputChange('craftType', e.target.value)}
              disabled={!editMode}
            >
              {craftTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Location/Region"
            value={formData.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            disabled={!editMode}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Experience Level</InputLabel>
            <Select
              value={formData.experience}
              label="Experience Level"
              onChange={(e) => handleInputChange('experience', e.target.value)}
              disabled={!editMode}
            >
              {experienceLevels.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      </Grid>

      {/* About Section */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            About Your Craft
          </Typography>
          
          <TextField
            fullWidth
            label="Short Bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={!editMode}
            margin="normal"
            multiline
            rows={3}
            placeholder="Tell people about your craft in a few words..."
          />
          
          <TextField
            fullWidth
            label="About Me"
            value={formData.aboutMe}
            onChange={(e) => handleInputChange('aboutMe', e.target.value)}
            disabled={!editMode}
            margin="normal"
            multiline
            rows={5}
            placeholder="Share your journey, inspiration, and what makes your craft special..."
          />
        </Paper>
      </Grid>

      {/* Contact Information */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.contact.phone}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Website"
                value={formData.contact.website}
                onChange={(e) => handleInputChange('contact.website', e.target.value)}
                disabled={!editMode}
                margin="normal"
                placeholder="https://yourwebsite.com"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Instagram"
                value={formData.contact.social.instagram}
                onChange={(e) => handleInputChange('contact.social.instagram', e.target.value)}
                disabled={!editMode}
                margin="normal"
                placeholder="@yourusername"
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ProfileManager;
