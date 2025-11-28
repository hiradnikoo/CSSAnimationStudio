import React from 'react';
import { CanvasObject } from '@/types';

interface RenderObjectProps {
    object: CanvasObject;
    isSelected: boolean;
}

export default function RenderObject({ object, isSelected }: RenderObjectProps) {
    const style: React.CSSProperties = {
        position: 'absolute',
        left: object.x,
        top: object.y,
        width: object.width,
        height: object.height,
        backgroundColor: object.type === 'rectangle' || object.type === 'circle' ? object.fill : 'transparent',
        border: isSelected ? '2px solid var(--primary)' : '1px solid transparent',
        cursor: 'move',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: object.type === 'text' ? object.fill : 'inherit',

        userSelect: 'none',
        transform: `rotate(${object.rotation || 0}deg)`,
        opacity: object.opacity ?? 1,
        borderRadius: object.type === 'circle' ? '50%' : object.borderRadius ? `${object.borderRadius}px` : '0',
        fontFamily: object.fontFamily ?? 'Inter',
        fontSize: object.fontSize ? `${object.fontSize}px` : object.type === 'text' ? '16px' : 'inherit',
        fontWeight: object.fontWeight ?? 'normal',
        fontStyle: object.fontStyle ?? 'normal',
        textDecoration: object.textDecoration ?? 'none',
        textAlign: (object.textAlign as any) ?? 'left',
        direction: (object.direction as any) ?? 'ltr',
        lineHeight: object.lineHeight ?? 1.5,
        letterSpacing: object.letterSpacing ? `${object.letterSpacing}px` : '0px',
    };

    if (object.type === 'text') {
        return (
            <div style={style}>
                {object.content}
            </div>
        );
    }

    if (object.type === 'triangle') {
        return (
            <div style={style}>
                <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: `${object.width / 2}px solid transparent`,
                    borderRight: `${object.width / 2}px solid transparent`,
                    borderBottom: `${object.height}px solid ${object.fill}`,
                }} />
            </div>
        );
    }

    if (object.type === 'star') {
        return (
            <div style={style}>
                <svg viewBox="0 0 24 24" width="100%" height="100%" style={{ fill: object.fill }}>
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
            </div>
        );
    }

    return <div style={style} />;
}
