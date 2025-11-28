"use client";

import React from 'react';
import { useCanvas } from '@/context/CanvasContext';
import { Paper, Typography, TextField, Box, Autocomplete, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FormatBold, FormatItalic, FormatUnderlined, FormatStrikethrough, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify, FormatTextdirectionLToR, FormatTextdirectionRToL } from '@mui/icons-material';
import BezierEditor from './BezierEditor';
import { loadFont, POPULAR_GOOGLE_FONTS } from '@/utils/fontUtils';

const FontOption = ({ font, ...props }: { font: string } & React.HTMLAttributes<HTMLLIElement>) => {
    React.useEffect(() => {
        loadFont(font);
    }, [font]);

    return (
        <li {...props} style={{ fontFamily: font, fontSize: '1.1em' }}>
            {font}
        </li>
    );
};

export default function PropertyPanel() {
    const { objects, selectedId, updateObject, tracks, currentTime, updateKeyframe, saveHistory } = useCanvas();
    const selectedObject = objects.find((obj) => obj.id === selectedId);

    const handleChange = (key: string, value: string | number) => {
        if (selectedObject) {
            updateObject(selectedObject.id, { [key]: value });
        }
    };

    // Find active keyframe at current time
    const activeKeyframe = selectedId ? tracks.find(t => t.objectId === selectedId)?.keyframes.find(k => k.time === currentTime) : null;

    const handleEasingChange = (value: string) => {
        if (selectedId && activeKeyframe) {
            updateKeyframe(selectedId, activeKeyframe.id, { easing: value }, false);
        }
    };

    if (!selectedObject) {
        return (
            <Paper
                elevation={0}
                sx={{
                    gridArea: 'properties',
                    bgcolor: 'background.paper',
                    borderLeft: 1,
                    borderColor: 'divider',
                    p: 2,
                    height: '100%',
                    overflowY: 'auto'
                }}
            >
                <Typography variant="h6" gutterBottom color="text.secondary">
                    Properties
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No object selected
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{
                gridArea: 'properties',
                bgcolor: 'background.paper',
                borderLeft: 1,
                borderColor: 'divider',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                height: '100%',
                overflowY: 'auto'
            }}
        >
            <Typography variant="h6" gutterBottom color="text.primary">
                Properties
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    label="X"
                    type="number"
                    size="small"
                    value={Math.round(selectedObject.x)}
                    onChange={(e) => handleChange('x', Number(e.target.value))}
                    fullWidth
                />
                <TextField
                    label="Y"
                    type="number"
                    size="small"
                    value={Math.round(selectedObject.y)}
                    onChange={(e) => handleChange('y', Number(e.target.value))}
                    fullWidth
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    label="Width"
                    type="number"
                    size="small"
                    value={selectedObject.width}
                    onChange={(e) => handleChange('width', Number(e.target.value))}
                    fullWidth
                />
                <TextField
                    label="Height"
                    type="number"
                    size="small"
                    value={selectedObject.height}
                    onChange={(e) => handleChange('height', Number(e.target.value))}
                    fullWidth
                />
            </Box>

            <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                    Color
                </Typography>
                <input
                    type="color"
                    value={selectedObject.fill}
                    onChange={(e) => handleChange('fill', e.target.value)}
                    style={{
                        width: '100%',
                        height: '40px',
                        padding: 0,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: 'transparent'
                    }}
                />
            </Box>

            {selectedObject.type === 'text' && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Font Family
                    </Typography>
                    <Autocomplete
                        size="small"
                        options={POPULAR_GOOGLE_FONTS}
                        value={selectedObject.fontFamily || 'Inter'}
                        onChange={(_, newValue) => {
                            if (newValue) {
                                loadFont(newValue);
                                updateObject(selectedObject.id, { fontFamily: newValue });
                            }
                        }}
                        renderInput={(params) => <TextField {...params} variant="outlined" sx={{ mt: 1 }} />}
                        renderOption={(props, option) => (
                            <FontOption {...props} key={option} font={option} />
                        )}
                    />

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <TextField
                            label="Size"
                            type="number"
                            size="small"
                            value={selectedObject.fontSize || 16}
                            onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                            fullWidth
                        />
                        <TextField
                            label="Line Height"
                            type="number"
                            size="small"
                            inputProps={{ step: 0.1 }}
                            value={selectedObject.lineHeight || 1.5}
                            onChange={(e) => handleChange('lineHeight', Number(e.target.value))}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <TextField
                            label="Spacing"
                            type="number"
                            size="small"
                            value={selectedObject.letterSpacing || 0}
                            onChange={(e) => handleChange('letterSpacing', Number(e.target.value))}
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                        <ToggleButtonGroup
                            size="small"
                            value={[
                                selectedObject.fontWeight === 'bold' ? 'bold' : null,
                                selectedObject.fontStyle === 'italic' ? 'italic' : null,
                                selectedObject.textDecoration?.includes('underline') ? 'underline' : null,
                                selectedObject.textDecoration?.includes('line-through') ? 'line-through' : null,
                            ].filter(Boolean)}
                            onChange={(_, newFormats) => {
                                updateObject(selectedObject.id, {
                                    fontWeight: newFormats.includes('bold') ? 'bold' : 'normal',
                                    fontStyle: newFormats.includes('italic') ? 'italic' : 'normal',
                                    textDecoration: newFormats.includes('underline') ? 'underline' : newFormats.includes('line-through') ? 'line-through' : 'none'
                                });
                            }}
                        >
                            <ToggleButton value="bold"><FormatBold /></ToggleButton>
                            <ToggleButton value="italic"><FormatItalic /></ToggleButton>
                            <ToggleButton value="underline"><FormatUnderlined /></ToggleButton>
                            <ToggleButton value="line-through"><FormatStrikethrough /></ToggleButton>
                        </ToggleButtonGroup>

                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={selectedObject.textAlign || 'left'}
                            onChange={(_, newAlign) => {
                                if (newAlign) updateObject(selectedObject.id, { textAlign: newAlign });
                            }}
                        >
                            <ToggleButton value="left"><FormatAlignLeft /></ToggleButton>
                            <ToggleButton value="center"><FormatAlignCenter /></ToggleButton>
                            <ToggleButton value="right"><FormatAlignRight /></ToggleButton>
                            <ToggleButton value="justify"><FormatAlignJustify /></ToggleButton>
                        </ToggleButtonGroup>

                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={selectedObject.direction || 'ltr'}
                            onChange={(_, newDir) => {
                                if (newDir) updateObject(selectedObject.id, { direction: newDir });
                            }}
                        >
                            <ToggleButton value="ltr"><FormatTextdirectionLToR /></ToggleButton>
                            <ToggleButton value="rtl"><FormatTextdirectionRToL /></ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
            )}

            {selectedObject.type === 'text' && (
                <TextField
                    label="Content"
                    type="text"
                    size="small"
                    value={selectedObject.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                />
            )}

            {activeKeyframe && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Keyframe Easing
                    </Typography>
                    <BezierEditor
                        value={activeKeyframe.easing || 'cubic-bezier(0,0,1,1)'}
                        onChange={handleEasingChange}
                        onCommit={saveHistory}
                    />
                </Box>
            )}
        </Paper>
    );
}
