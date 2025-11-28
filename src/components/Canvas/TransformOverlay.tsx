"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CanvasObject } from '@/types';

interface TransformOverlayProps {
    object: CanvasObject;
    onUpdate: (changes: Partial<CanvasObject>) => void;
    onCommit: () => void;
}

export default function TransformOverlay({ object, onUpdate, onCommit }: TransformOverlayProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState<string | null>(null);
    const startPosRef = useRef({ x: 0, y: 0 });
    const startObjRef = useRef<CanvasObject | null>(null);

    const handleMouseDown = (e: React.MouseEvent, type: string) => {
        e.stopPropagation();
        setIsDragging(true);
        setDragType(type);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        startObjRef.current = { ...object };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !startObjRef.current) return;

            const dx = e.clientX - startPosRef.current.x;
            const dy = e.clientY - startPosRef.current.y;
            const startObj = startObjRef.current;

            let changes: Partial<CanvasObject> = {};

            if (dragType === 'move') {
                // Handled by Canvas drag, but if we wanted to handle it here:
                // changes = { x: startObj.x + dx, y: startObj.y + dy };
            } else if (dragType === 'rotate') {
                // Calculate angle relative to center
                const centerX = startObj.x + startObj.width / 2;
                const centerY = startObj.y + startObj.height / 2;
                const startAngle = Math.atan2(startPosRef.current.y - centerY, startPosRef.current.x - centerX);
                const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                const rotationDiff = (currentAngle - startAngle) * (180 / Math.PI);
                changes = { rotation: (startObj.rotation || 0) + rotationDiff };
            } else {
                // Resize Logic
                // This is a simplified resize logic (doesn't account for rotation yet)
                // For rotated resize, we'd need to project mouse delta onto local axes.

                // Top-Left
                if (dragType === 'tl') {
                    changes = {
                        x: startObj.x + dx,
                        y: startObj.y + dy,
                        width: startObj.width - dx,
                        height: startObj.height - dy
                    };
                }
                // Top-Right
                else if (dragType === 'tr') {
                    changes = {
                        y: startObj.y + dy,
                        width: startObj.width + dx,
                        height: startObj.height - dy
                    };
                }
                // Bottom-Left
                else if (dragType === 'bl') {
                    changes = {
                        x: startObj.x + dx,
                        width: startObj.width - dx,
                        height: startObj.height + dy
                    };
                }
                // Bottom-Right
                else if (dragType === 'br') {
                    changes = {
                        width: startObj.width + dx,
                        height: startObj.height + dy
                    };
                }
                // Top
                else if (dragType === 't') {
                    changes = {
                        y: startObj.y + dy,
                        height: startObj.height - dy
                    };
                }
                // Bottom
                else if (dragType === 'b') {
                    changes = {
                        height: startObj.height + dy
                    };
                }
                // Left
                else if (dragType === 'l') {
                    changes = {
                        x: startObj.x + dx,
                        width: startObj.width - dx
                    };
                }
                // Right
                else if (dragType === 'r') {
                    changes = {
                        width: startObj.width + dx
                    };
                }
            }

            onUpdate(changes);
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
                setDragType(null);
                onCommit();
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragType, onUpdate, onCommit]);

    const handleStyle = {
        width: 10,
        height: 10,
        backgroundColor: 'white',
        border: '1px solid var(--primary)',
        position: 'absolute' as const,
        pointerEvents: 'auto' as const,
    };

    // Calculate handle positions based on width/height
    // Note: This overlay rotates WITH the object
    return (
        <div
            style={{
                position: 'absolute',
                left: object.x,
                top: object.y,
                width: object.width,
                height: object.height,
                transform: `rotate(${object.rotation || 0}deg)`,
                pointerEvents: 'none', // Allow clicks to pass through to object for drag
                border: '1px solid var(--primary)',
                boxSizing: 'border-box'
            }}
        >
            {/* Rotation Handle */}
            <div
                style={{
                    ...handleStyle,
                    top: -30,
                    left: '50%',
                    transform: 'translate(-50%, 0)',
                    borderRadius: '50%',
                    cursor: 'grab',
                    backgroundColor: 'var(--primary)'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'rotate')}
            />
            <div style={{ position: 'absolute', top: -20, left: '50%', height: 20, width: 1, backgroundColor: 'var(--primary)' }} />

            {/* Corner Handles */}
            <div style={{ ...handleStyle, top: -5, left: -5, cursor: 'nwse-resize' }} onMouseDown={(e) => handleMouseDown(e, 'tl')} />
            <div style={{ ...handleStyle, top: -5, right: -5, cursor: 'nesw-resize' }} onMouseDown={(e) => handleMouseDown(e, 'tr')} />
            <div style={{ ...handleStyle, bottom: -5, left: -5, cursor: 'nesw-resize' }} onMouseDown={(e) => handleMouseDown(e, 'bl')} />
            <div style={{ ...handleStyle, bottom: -5, right: -5, cursor: 'nwse-resize' }} onMouseDown={(e) => handleMouseDown(e, 'br')} />

            {/* Side Handles */}
            <div style={{ ...handleStyle, top: -5, left: '50%', transform: 'translate(-50%, 0)', cursor: 'ns-resize' }} onMouseDown={(e) => handleMouseDown(e, 't')} />
            <div style={{ ...handleStyle, bottom: -5, left: '50%', transform: 'translate(-50%, 0)', cursor: 'ns-resize' }} onMouseDown={(e) => handleMouseDown(e, 'b')} />
            <div style={{ ...handleStyle, top: '50%', left: -5, transform: 'translate(0, -50%)', cursor: 'ew-resize' }} onMouseDown={(e) => handleMouseDown(e, 'l')} />
            <div style={{ ...handleStyle, top: '50%', right: -5, transform: 'translate(0, -50%)', cursor: 'ew-resize' }} onMouseDown={(e) => handleMouseDown(e, 'r')} />
        </div>
    );
}
