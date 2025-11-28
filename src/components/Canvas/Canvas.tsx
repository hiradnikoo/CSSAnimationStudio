"use client";

import React, { useRef, useState } from 'react';
import { useCanvas } from '@/context/CanvasContext';
import RenderObject from './RenderObject';
import TransformOverlay from './TransformOverlay';
import { Box, Typography, Paper } from '@mui/material';

export default function Canvas() {
    const { objects, selectedId, selectObject, updateObject, saveHistory } = useCanvas();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent, id: string, x: number, y: number) => {
        e.stopPropagation();
        selectObject(id);
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - x,
            y: e.clientY - y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && selectedId) {
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            updateObject(selectedId, { x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            saveHistory();
        }
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent, id: string, x: number, y: number) => {
        e.stopPropagation();
        const touch = e.touches[0];
        selectObject(id);
        setIsDragging(true);
        setDragOffset({
            x: touch.clientX - x,
            y: touch.clientY - y,
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging && selectedId) {
            // Prevent scrolling while dragging
            // e.preventDefault(); // React synthetic events might not support this directly in all cases, but usually fine.
            const touch = e.touches[0];
            const newX = touch.clientX - dragOffset.x;
            const newY = touch.clientY - dragOffset.y;
            updateObject(selectedId, { x: newX, y: newY });
        }
    };

    const handleTouchEnd = () => {
        if (isDragging) {
            saveHistory();
        }
        setIsDragging(false);
    };

    const handleCanvasClick = () => {
        selectObject(null);
    };

    return (
        <Box
            component="section"
            sx={{
                gridArea: 'canvas',
                bgcolor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
                position: 'relative',
                p: 4,
                touchAction: 'none' // Important for touch dragging
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <Paper
                ref={canvasRef}
                elevation={4}
                sx={{
                    width: 800,
                    height: 600,
                    bgcolor: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onClick={handleCanvasClick}
            >
                {objects.map((obj) => (
                    <Box
                        key={obj.id}
                        onMouseDown={(e) => handleMouseDown(e, obj.id, obj.x, obj.y)}
                        onTouchStart={(e) => handleTouchStart(e, obj.id, obj.x, obj.y)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ position: 'absolute', top: 0, left: 0 }}
                    >
                        <RenderObject
                            object={obj}
                            isSelected={obj.id === selectedId}
                        />
                    </Box>
                ))}

                {selectedId && objects.find(o => o.id === selectedId) && (
                    <TransformOverlay
                        object={objects.find(o => o.id === selectedId)!}
                        onUpdate={(changes) => updateObject(selectedId, changes)}
                        onCommit={saveHistory}
                    />
                )}

                {objects.length === 0 && (
                    <Typography
                        variant="body1"
                        color="text.disabled"
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none'
                        }}
                    >
                        Add an object from the sidebar
                    </Typography>
                )}
            </Paper>
        </Box>
    );
}
