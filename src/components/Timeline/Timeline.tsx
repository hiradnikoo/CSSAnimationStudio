"use client";

import React, { useRef, useState } from 'react';
import { useCanvas } from '@/context/CanvasContext';
import { Box, IconButton, Typography, Paper, Tooltip, Slider } from '@mui/material';
import { PlayArrow, Pause, Stop, AddCircleOutline } from '@mui/icons-material';

export default function Timeline() {
    const { tracks, currentTime, setCurrentTime, selectedId, addKeyframe, allObjects, isPlaying, togglePlay, stop, selectObject, updateObject, splitObject } = useCanvas();
    const objects = allObjects; // Use allObjects for Timeline rendering
    const timelineRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [draggingHandle, setDraggingHandle] = useState<{ id: string, type: 'start' | 'end' | 'move', startX: number, initialTime: number, initialDuration?: number } | null>(null);

    const handleScrub = (e: React.MouseEvent) => {
        if (draggingHandle) return; // Don't scrub if dragging handle
        if (!timelineRef.current) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        setCurrentTime(percentage * 10000);
    };

    const handleTouchScrub = (e: React.TouchEvent) => {
        if (draggingHandle) return;
        if (!timelineRef.current) return;
        const touch = e.touches[0];
        const rect = timelineRef.current.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        setCurrentTime(percentage * 10000);
    };

    const handleAddKeyframe = () => {
        if (selectedId) {
            const selectedObject = objects.find(o => o.id === selectedId);
            if (selectedObject) {
                const { x, y, width, height, fill } = selectedObject;
                addKeyframe(selectedId, { x, y, width, height, fill });
            }
        }
    };

    const handleSplit = () => {
        if (selectedId) {
            splitObject(selectedId);
        }
    };

    const handleMouseDown = (e: React.MouseEvent, id: string, type: 'start' | 'end' | 'move') => {
        e.stopPropagation();
        const obj = objects.find(o => o.id === id);
        if (!obj) return;

        setDraggingHandle({
            id,
            type,
            startX: e.clientX,
            initialTime: type === 'end' ? (obj.endTime ?? 10000) : (obj.startTime ?? 0),
            initialDuration: (obj.endTime ?? 10000) - (obj.startTime ?? 0)
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingHandle || !timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const deltaX = e.clientX - draggingHandle.startX;
        const deltaTime = (deltaX / rect.width) * 10000;

        const obj = objects.find(o => o.id === draggingHandle.id);
        if (!obj) return;

        if (draggingHandle.type === 'start') {
            const newStart = Math.max(0, Math.min((obj.endTime ?? 10000) - 100, draggingHandle.initialTime + deltaTime));
            updateObject(draggingHandle.id, { startTime: newStart });
        } else if (draggingHandle.type === 'end') {
            const newEnd = Math.max((obj.startTime ?? 0) + 100, Math.min(10000, draggingHandle.initialTime + deltaTime));
            updateObject(draggingHandle.id, { endTime: newEnd });
        } else if (draggingHandle.type === 'move') {
            const duration = draggingHandle.initialDuration ?? 1000;
            const newStart = Math.max(0, Math.min(10000 - duration, (obj.startTime ?? 0) + deltaTime)); // This logic is slightly flawed for 'move' because it accumulates delta on current state.
            // Better: Calculate absolute new time based on initial time + delta
            const absoluteNewStart = Math.max(0, Math.min(10000 - duration, draggingHandle.initialTime + deltaTime));
            updateObject(draggingHandle.id, {
                startTime: absoluteNewStart,
                endTime: absoluteNewStart + duration
            });
        }
    };

    const handleMouseUp = () => {
        setDraggingHandle(null);
    };

    // Attach global mouse listeners for dragging
    React.useEffect(() => {
        if (draggingHandle) {
            window.addEventListener('mousemove', handleMouseMove as any);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove as any);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingHandle]);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
    };

    return (
        <Paper
            elevation={3}
            sx={{
                gridArea: 'timeline',
                display: 'flex',
                flexDirection: 'column',
                p: 1,
                gap: 1,
                borderTop: 1,
                borderColor: 'divider',
                zIndex: 1200
            }}
        >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', px: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={isPlaying ? "Pause" : "Play"}>
                        <IconButton onClick={togglePlay} color="primary" size="small">
                            {isPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Stop">
                        <IconButton onClick={stop} color="error" size="small">
                            <Stop />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Keyframe">
                        <span>
                            <IconButton onClick={handleAddKeyframe} disabled={!selectedId} color="secondary" size="small">
                                <AddCircleOutline />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Split Object">
                        <span>
                            <IconButton onClick={handleSplit} disabled={!selectedId} color="warning" size="small">
                                <Box sx={{ transform: 'rotate(90deg)', display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: 2, height: 12, bgcolor: 'currentColor', mx: 0.5 }} />
                                </Box>
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50, fontFamily: 'monospace' }}>
                    {formatTime(currentTime)}
                </Typography>

                <Box sx={{ width: 200, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">Zoom</Typography>
                    <Slider
                        size="small"
                        value={zoom}
                        min={1}
                        max={10}
                        step={0.1}
                        onChange={(_, value) => setZoom(value as number)}
                        sx={{ flexGrow: 1 }}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    flexGrow: 1,
                    overflowX: 'auto',
                    overflowY: 'auto',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.default',
                    position: 'relative'
                }}
            >
                <Box
                    ref={timelineRef}
                    onClick={handleScrub}
                    onTouchStart={handleTouchScrub}
                    onTouchMove={handleTouchScrub}
                    sx={{
                        width: `${zoom * 100}%`,
                        minHeight: '100%',
                        position: 'relative',
                        cursor: 'pointer',
                        touchAction: 'none' // Important for scrubbing without scrolling
                    }}
                >
                    {/* Ruler */}
                    <Box
                        onClick={handleScrub}
                        sx={{
                            height: 24,
                            borderBottom: 1,
                            borderColor: 'divider',
                            position: 'sticky',
                            top: 0,
                            bgcolor: 'background.paper',
                            zIndex: 5,
                            display: 'flex',
                            cursor: 'pointer'
                        }}>
                        {/* Generate ticks based on total time (10s) */}
                        {Array.from({ length: 11 }).map((_, i) => (
                            <Box key={i} sx={{
                                position: 'absolute',
                                left: `${i * 10}%`,
                                height: '100%',
                                borderLeft: '1px solid',
                                borderColor: 'text.disabled',
                                pl: 0.5,
                                pointerEvents: 'none'
                            }}>
                                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
                                    {i}s
                                </Typography>
                            </Box>
                        ))}

                        {/* Minor ticks if zoomed in */}
                        {zoom > 2 && Array.from({ length: 100 }).map((_, i) => {
                            if (i % 10 === 0) return null; // Skip main seconds
                            return (
                                <Box key={`minor-${i}`} sx={{
                                    position: 'absolute',
                                    left: `${i}%`,
                                    height: '30%',
                                    bottom: 0,
                                    borderLeft: '1px solid',
                                    borderColor: 'divider',
                                    pointerEvents: 'none'
                                }} />
                            );
                        })}
                    </Box>

                    {/* Scrubber Line */}
                    <Box sx={{
                        position: 'absolute',
                        left: `${(currentTime / 10000) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        bgcolor: 'error.main',
                        zIndex: 10,
                        pointerEvents: 'none'
                    }} />

                    {/* Tracks */}
                    <Box
                        onClick={handleScrub}
                        sx={{ p: 1, minHeight: 'calc(100% - 24px)' }}
                    >
                        {tracks.map((track) => {
                            const obj = objects.find(o => o.id === track.objectId);
                            if (!obj) return null;

                            const startPercent = ((obj.startTime ?? 0) / 10000) * 100;
                            const durationPercent = (((obj.endTime ?? 10000) - (obj.startTime ?? 0)) / 10000) * 100;

                            return (
                                <Box key={track.objectId}
                                    sx={{
                                        height: 32,
                                        mb: 0.5,
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}>

                                    {/* Clip Bar */}
                                    <Box
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectObject(track.objectId);
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, track.objectId, 'move')}
                                        sx={{
                                            position: 'absolute',
                                            left: `${startPercent}%`,
                                            width: `${durationPercent}%`,
                                            height: '100%',
                                            bgcolor: selectedId === track.objectId ? 'primary.light' : 'action.hover',
                                            borderRadius: 1,
                                            border: selectedId === track.objectId ? '1px solid' : 'none',
                                            borderColor: 'primary.main',
                                            cursor: 'grab',
                                            overflow: 'hidden',
                                            '&:active': { cursor: 'grabbing' }
                                        }}
                                    >
                                        <Typography variant="caption" sx={{
                                            position: 'absolute',
                                            left: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'text.primary',
                                            pointerEvents: 'none',
                                            zIndex: 2,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {obj.type} {obj.id.slice(0, 4)}
                                        </Typography>

                                        {/* Left Handle */}
                                        <Box
                                            onMouseDown={(e) => handleMouseDown(e, track.objectId, 'start')}
                                            sx={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: 6,
                                                cursor: 'ew-resize',
                                                bgcolor: 'rgba(0,0,0,0.1)',
                                                zIndex: 3,
                                                '&:hover': { bgcolor: 'primary.main' }
                                            }}
                                        />

                                        {/* Right Handle */}
                                        <Box
                                            onMouseDown={(e) => handleMouseDown(e, track.objectId, 'end')}
                                            sx={{
                                                position: 'absolute',
                                                right: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: 6,
                                                cursor: 'ew-resize',
                                                bgcolor: 'rgba(0,0,0,0.1)',
                                                zIndex: 3,
                                                '&:hover': { bgcolor: 'primary.main' }
                                            }}
                                        />
                                    </Box>

                                    {/* Render Keyframes (Relative to Clip) */}
                                    {/* Actually, keyframes are absolute time. We should render them relative to the timeline container, but visually on top of the clip? */}
                                    {/* Or render them inside the clip? If inside, we need to map absolute time to relative clip position. */}
                                    {/* Easier to render them absolute but checking if they fall within the clip. */}

                                    {track.keyframes.map((kf) => {
                                        if (kf.time < (obj.startTime ?? 0) || kf.time > (obj.endTime ?? 10000)) return null;

                                        return (
                                            <Box
                                                key={kf.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentTime(kf.time);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    left: `${(kf.time / 10000) * 100}%`,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transform: 'translate(-50%, 0)',
                                                    cursor: 'pointer',
                                                    zIndex: 10,
                                                    pointerEvents: 'auto', // Ensure clickable even if outside clip (though we filter above)
                                                    '&:hover .keyframe-dot': { transform: 'scale(1.2)' }
                                                }}
                                            >
                                                <Box className="keyframe-dot" sx={{
                                                    width: 10,
                                                    height: 10,
                                                    bgcolor: 'white',
                                                    borderRadius: '45%',
                                                    transform: 'rotate(45deg)',
                                                    border: '1px solid',
                                                    borderColor: 'primary.main',
                                                    boxShadow: 1,
                                                    transition: 'transform 0.1s'
                                                }} />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}
