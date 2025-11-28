"use client";

import React from 'react';
import { useCanvas } from '@/context/CanvasContext';
import { Drawer, IconButton, Tooltip, Box } from '@mui/material';
import { RectangleOutlined, TextFields, Undo, Redo, CircleOutlined, ChangeHistory, StarBorder } from '@mui/icons-material';

const drawerWidth = 60;

export default function Sidebar() {
    const { addObject, undo, redo, canUndo, canRedo } = useCanvas();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', top: '64px', height: 'calc(100% - 64px)' },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 2 }}>
                <Tooltip title="Rectangle" placement="right">
                    <IconButton onClick={() => addObject('rectangle')} color="primary">
                        <RectangleOutlined />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Text" placement="right">
                    <IconButton onClick={() => addObject('text')} color="primary">
                        <TextFields />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Circle" placement="right">
                    <IconButton onClick={() => addObject('circle')} color="primary">
                        <CircleOutlined />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Triangle" placement="right">
                    <IconButton onClick={() => addObject('triangle')} color="primary">
                        <ChangeHistory />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Star" placement="right">
                    <IconButton onClick={() => addObject('star')} color="primary">
                        <StarBorder />
                    </IconButton>
                </Tooltip>

                <Box sx={{ my: 2, width: '80%', height: 1, bgcolor: 'divider' }} />

                <Tooltip title="Undo" placement="right">
                    <span>
                        <IconButton onClick={undo} disabled={!canUndo} color="primary">
                            <Undo />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Redo" placement="right">
                    <span>
                        <IconButton onClick={redo} disabled={!canRedo} color="primary">
                            <Redo />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </Drawer>
    );
}
