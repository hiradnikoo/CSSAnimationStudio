"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface BezierEditorProps {
    value: string;
    onChange: (value: string) => void;
    onCommit?: () => void;
}

export default function BezierEditor({ value, onChange, onCommit }: BezierEditorProps) {
    // Parse initial value or default to linear
    const parseBezier = (val: string) => {
        const match = val.match(/cubic-bezier\(([\d.]+),\s*([\d.-]+),\s*([\d.]+),\s*([\d.-]+)\)/);
        if (match) {
            return {
                x1: parseFloat(match[1]),
                y1: parseFloat(match[2]),
                x2: parseFloat(match[3]),
                y2: parseFloat(match[4])
            };
        }
        return { x1: 0, y1: 0, x2: 1, y2: 1 }; // Default linear-ish
    };

    const [points, setPoints] = useState(parseBezier(value));
    const svgRef = useRef<SVGSVGElement>(null);
    const [dragging, setDragging] = useState<'p1' | 'p2' | null>(null);

    useEffect(() => {
        setPoints(parseBezier(value));
    }, [value]);

    const handleMouseDown = (point: 'p1' | 'p2') => {
        setDragging(point);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        // Y is inverted in SVG (0 is top), but for bezier editor usually bottom-left is 0,0
        // Let's keep standard SVG coords: 0,0 top-left, 1,1 bottom-right.
        // But CSS cubic-bezier expects y to be value (0-1). 
        // Visual editors usually show time on X and value on Y (inverted).
        // Let's map: 
        // Visual X: 0 -> 1 (Time)
        // Visual Y: 1 -> 0 (Value, 1 is top, 0 is bottom in css logic, but in SVG 0 is top)
        // Wait, CSS cubic bezier: P0 is (0,0), P3 is (1,1).
        // P1(x1, y1) and P2(x2, y2).
        // If we draw in 200x200 box.
        // (0, 200) is start (0,0). (200, 0) is end (1,1).

        // Let's calculate normalized Y based on SVG coordinate (0 at top)
        // val = 1 - (y / height)
        const y = 1 - Math.max(-0.5, Math.min(1.5, (e.clientY - rect.top) / rect.height));

        const newPoints = { ...points, [dragging === 'p1' ? 'x1' : 'x2']: x, [dragging === 'p1' ? 'y1' : 'y2']: y };
        setPoints(newPoints);
        onChange(`cubic-bezier(${newPoints.x1.toFixed(2)}, ${newPoints.y1.toFixed(2)}, ${newPoints.x2.toFixed(2)}, ${newPoints.y2.toFixed(2)})`);
    };

    const handleMouseUp = () => {
        if (dragging && onCommit) {
            onCommit();
        }
        setDragging(null);
    };

    // Convert normalized coords to SVG coords
    const toSvg = (x: number, y: number) => ({
        x: x * 200,
        y: (1 - y) * 200
    });

    const p0 = toSvg(0, 0);
    const p3 = toSvg(1, 1);
    const p1 = toSvg(points.x1, points.y1);
    const p2 = toSvg(points.x2, points.y2);

    return (
        <Paper elevation={2} sx={{ p: 2, width: '100%' }}>
            <Typography variant="caption" gutterBottom>Transition Curve</Typography>
            <Box
                sx={{
                    width: 200,
                    height: 200,
                    border: '1px solid #333',
                    bgcolor: '#111',
                    position: 'relative',
                    margin: '0 auto',
                    cursor: dragging ? 'grabbing' : 'default'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg ref={svgRef} width="200" height="200" style={{ overflow: 'visible' }}>
                    {/* Grid / Guidelines */}
                    <line x1="0" y1="200" x2="200" y2="0" stroke="#333" strokeDasharray="4" />

                    {/* Handles */}
                    <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#666" />
                    <line x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y} stroke="#666" />

                    {/* Curve */}
                    <path
                        d={`M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`}
                        stroke="#3b82f6"
                        strokeWidth="3"
                        fill="none"
                    />

                    {/* Control Points */}
                    <circle
                        cx={p1.x} cy={p1.y} r="6" fill="#ec4899"
                        onMouseDown={() => handleMouseDown('p1')}
                        style={{ cursor: 'grab' }}
                    />
                    <circle
                        cx={p2.x} cy={p2.y} r="6" fill="#ec4899"
                        onMouseDown={() => handleMouseDown('p2')}
                        style={{ cursor: 'grab' }}
                    />
                </svg>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', fontFamily: 'monospace' }}>
                {value}
            </Typography>
        </Paper>
    );
}
