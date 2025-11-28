"use client";

import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Canvas from '../Canvas/Canvas';
import PropertyPanel from '../Properties/PropertyPanel';
import Timeline from '../Timeline/Timeline';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

export default function MainLayout() {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateAreas: `
        "header header header"
        "sidebar canvas properties"
        "timeline timeline timeline"
      `,
            gridTemplateColumns: '60px 1fr 300px',
            gridTemplateRows: '64px 1fr 200px',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            bgcolor: 'background.default',
            color: 'text.primary'
        }}>
            <AppBar position="static" elevation={0} sx={{ gridArea: 'header', borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        CSS Animation Studio
                    </Typography>
                </Toolbar>
            </AppBar>

            <Sidebar />
            <Canvas />
            <PropertyPanel />
            <Timeline />
        </Box>
    );
}
