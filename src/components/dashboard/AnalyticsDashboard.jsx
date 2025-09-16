import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const AnalyticsDashboard = ({ analytics }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Analytics Dashboard
        </Typography>
        <Typography>
          Total Views: {analytics?.totalViews || 0}
        </Typography>
        <Typography>
          Total Posts: {analytics?.totalPosts || 0}
        </Typography>
        <Typography>
          Engagement Rate: {analytics?.avgEngagement || 0}%
        </Typography>
      </Paper>
    </Grid>
  </Grid>
);

export default AnalyticsDashboard;
