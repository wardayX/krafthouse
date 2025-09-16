import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  Chip,
  LinearProgress,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person,
  Camera,
  Analytics,
  SmartToy,
  TrendingUp,
  Visibility,
  ThumbUp,
  Comment,
  Add
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import ProfileManager from './ProfileManager';
import ContentCreator from './ContentCreator';
import AnalyticsDashboard from './AnalyticsDashboard';
import AIAssistant from './AIAssistant';

const ArtisanDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [artisanData, setArtisanData] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [profileResponse, postsResponse, analyticsResponse] = await Promise.all([
        apiService.getArtisanProfile(currentUser.uid),
        apiService.getArtisanPosts(currentUser.uid, { limit: 10 }),
        apiService.getArtisanAnalytics(currentUser.uid, { days: 30 })
      ]);

      setArtisanData(profileResponse.data);
      setRecentPosts(postsResponse.data.posts);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: 'Overview', icon: <DashboardIcon /> },
    { label: 'Profile', icon: <Person /> },
    { label: 'Create', icon: <Camera /> },
    { label: 'Analytics', icon: <Analytics /> },
    { label: 'AI Assistant', icon: <SmartToy /> }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={artisanData?.profileImage}
            sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}
          >
            {artisanData?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Welcome back, {artisanData?.name}! 👋
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip label={artisanData?.craftType} color="primary" size="small" sx={{ mr: 1 }} />
              <Chip label={artisanData?.region} variant="outlined" size="small" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ minHeight: 64, textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <DashboardOverview
          artisanData={artisanData}
          recentPosts={recentPosts}
          analytics={analytics}
        />
      )}
      {activeTab === 1 && (
        <ProfileManager
          artisanData={artisanData}
          onUpdate={setArtisanData}
        />
      )}
      {activeTab === 2 && (
        <ContentCreator
          onPostCreated={loadDashboardData}
        />
      )}
      {activeTab === 3 && (
        <AnalyticsDashboard
          analytics={analytics}
          artisanId={currentUser.uid}
        />
      )}
      {activeTab === 4 && (
        <AIAssistant
          artisanData={artisanData}
          recentPosts={recentPosts}
        />
      )}
    </Container>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ artisanData, recentPosts, analytics }) => (
  <Grid container spacing={3}>
    {/* Stats Cards */}
    <Grid item xs={12} md={3}>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Visibility color="primary" sx={{ mr: 1 }} />
            <Typography color="text.secondary" variant="body2">
              Total Views
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {analytics?.totalViews?.toLocaleString() || 0}
          </Typography>
          <Typography variant="body2" color="success.main">
            +12% from last month
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={3}>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Camera color="secondary" sx={{ mr: 1 }} />
            <Typography color="text.secondary" variant="body2">
              Posts
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {analytics?.totalPosts || 0}
          </Typography>
          <Typography variant="body2" color="success.main">
            +3 this week
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={3}>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUp color="success" sx={{ mr: 1 }} />
            <Typography color="text.secondary" variant="body2">
              Engagement
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {analytics?.avgEngagement || 0}%
          </Typography>
          <Typography variant="body2" color="success.main">
            +5% improvement
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={3}>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Comment color="warning" sx={{ mr: 1 }} />
            <Typography color="text.secondary" variant="body2">
              Inquiries
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={600}>
            {analytics?.inquiries || 0}
          </Typography>
          <Typography variant="body2" color="success.main">
            +2 this week
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* Recent Posts */}
    <Grid item xs={12}>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Recent Posts
            </Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              size="small"
              disableElevation
            >
              Create Post
            </Button>
          </Box>
          
          <Grid container spacing={2}>
            {recentPosts.slice(0, 6).map((post, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={post.imageUrl || '/placeholder-image.jpg'}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: 140,
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ pt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {post.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                      <Chip
                        icon={<Visibility />}
                        label={post.views || 0}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<ThumbUp />}
                        label={post.likes || 0}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

export default ArtisanDashboard;
