export type ObjectType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'text' | 'image';

export interface CanvasObject {
    id: string;
    type: ObjectType;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    rotation: number; // degrees
    opacity: number; // 0-1
    borderRadius?: number; // for rectangle
    content?: string; // For text objects
    fontFamily?: string; // For text objects
    fontSize?: number;
    fontWeight?: string; // normal, bold, 100-900
    fontStyle?: string; // normal, italic
    textDecoration?: string; // none, underline, line-through
    textAlign?: string; // left, center, right, justify
    direction?: string; // ltr, rtl
    lineHeight?: number;
    letterSpacing?: number;
    startTime?: number; // in milliseconds
    endTime?: number; // in milliseconds
}

export interface CanvasState {
    objects: CanvasObject[];
    selectedId: string | null;
}

export interface Keyframe {
    id: string;
    time: number; // in milliseconds
    properties: Partial<CanvasObject>;
    easing?: string; // e.g., "linear", "ease", "cubic-bezier(0.42, 0, 0.58, 1)"
}

export interface AnimationTrack {
    objectId: string;
    keyframes: Keyframe[];
}
