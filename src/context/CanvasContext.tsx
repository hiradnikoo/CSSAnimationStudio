"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CanvasObject, CanvasState, ObjectType, Keyframe, AnimationTrack } from '@/types';

interface CanvasContextType {
    objects: CanvasObject[];
    allObjects: CanvasObject[];
    selectedId: string | null;
    tracks: AnimationTrack[];
    currentTime: number;
    isPlaying: boolean;
    addObject: (type: ObjectType) => void;
    updateObject: (id: string, changes: Partial<CanvasObject>, saveToHistory?: boolean) => void;
    selectObject: (id: string | null) => void;
    addKeyframe: (objectId: string, properties: Partial<CanvasObject>, saveToHistory?: boolean) => void;
    updateKeyframe: (objectId: string, keyframeId: string, changes: Partial<Keyframe>, saveToHistory?: boolean) => void;
    setCurrentTime: (time: number) => void;
    togglePlay: () => void;
    stop: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    saveHistory: () => void;
    splitObject: (id: string) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
    const [objects, setObjects] = useState<CanvasObject[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [tracks, setTracks] = useState<AnimationTrack[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Undo/Redo History
    const [history, setHistory] = useState<CanvasState[]>([{ objects: [], selectedId: null }]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // Animation Loop
    useEffect(() => {
        let animationFrame: number;
        if (isPlaying) {
            const startTime = Date.now() - currentTime;
            const animate = () => {
                const now = Date.now();
                setCurrentTime(now - startTime);
                animationFrame = requestAnimationFrame(animate);
            };
            animationFrame = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying]);

    const saveState = (newObjects: CanvasObject[], newTracks: AnimationTrack[]) => {
        const newState: CanvasState = { objects: newObjects, selectedId };
        // We might want to save tracks in history too if we want to undo keyframe changes
        // For now, let's assume history tracks objects only for simplicity, but ideally it should track everything.
        // Let's update history to include tracks if we were fully implementing it.
        // For this simplified version, we'll just push object state.

        // Truncate future history if we're in the middle
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const previousState = history[newIndex];
            setObjects(previousState.objects);
            setSelectedId(previousState.selectedId);
            setHistoryIndex(newIndex);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextState = history[newIndex];
            setObjects(nextState.objects);
            setSelectedId(nextState.selectedId);
            setHistoryIndex(newIndex);
        }
    };

    const addObject = (type: ObjectType) => {
        const newObject: CanvasObject = {
            id: crypto.randomUUID(),
            type,
            x: 100,
            y: 100,
            width: type === 'text' ? 200 : 100,
            height: type === 'text' ? 50 : 100,
            fill: type === 'text' ? '#000000' : type === 'rectangle' ? '#3b82f6' : type === 'triangle' ? '#ef4444' : type === 'star' ? '#eab308' : type === 'circle' ? '#10b981' : '#ffffff',
            rotation: 0,
            opacity: 1,
            borderRadius: type === 'rectangle' ? 0 : undefined,
            content: type === 'text' ? 'New Text' : undefined,
            fontFamily: type === 'text' ? 'Inter' : undefined,
            fontSize: type === 'text' ? 16 : undefined,
            fontWeight: type === 'text' ? 'normal' : undefined,
            fontStyle: type === 'text' ? 'normal' : undefined,
            textDecoration: type === 'text' ? 'none' : undefined,
            textAlign: type === 'text' ? 'left' : undefined,
            direction: type === 'text' ? 'ltr' : undefined,
            lineHeight: type === 'text' ? 1.5 : undefined,
            letterSpacing: type === 'text' ? 0 : undefined,
            startTime: currentTime,
            endTime: currentTime + 5000, // Default 5 seconds duration
        };

        const newObjects = [...objects, newObject];
        const newTracks = [...tracks, { objectId: newObject.id, keyframes: [] }];

        setObjects(newObjects);
        setTracks(newTracks);
        setSelectedId(newObject.id);
        saveState(newObjects, newTracks);
    };

    const addKeyframe = (objectId: string, properties: Partial<CanvasObject>, saveToHistory = true) => {
        const newTracks = tracks.map((track) => {
            if (track.objectId === objectId) {
                const existingKeyframeIndex = track.keyframes.findIndex((k) => k.time === currentTime);

                let newKeyframes = [...track.keyframes];

                if (existingKeyframeIndex !== -1) {
                    // Update existing keyframe
                    const existingKeyframe = track.keyframes[existingKeyframeIndex];
                    const updatedKeyframe = {
                        ...existingKeyframe,
                        properties: { ...existingKeyframe.properties, ...properties }
                    };
                    newKeyframes[existingKeyframeIndex] = updatedKeyframe;
                } else {
                    // Create new keyframe
                    const newKeyframe: Keyframe = {
                        id: crypto.randomUUID(),
                        time: currentTime,
                        properties,
                    };
                    newKeyframes.push(newKeyframe);
                }

                return {
                    ...track,
                    keyframes: newKeyframes.sort((a, b) => a.time - b.time),
                };
            }
            return track;
        });

        setTracks(newTracks);
        if (saveToHistory) {
            saveState(objects, newTracks);
        }
    };

    const updateObject = (id: string, changes: Partial<CanvasObject>, saveToHistory = false) => {
        if (currentTime > 0) {
            addKeyframe(id, changes, saveToHistory);
        } else {
            const newObjects = objects.map((obj) => (obj.id === id ? { ...obj, ...changes } : obj));
            setObjects(newObjects);
            if (saveToHistory) {
                saveState(newObjects, tracks);
            }
        }
    };

    const selectObject = (id: string | null) => {
        setSelectedId(id);
    };

    const updateKeyframe = (objectId: string, keyframeId: string, changes: Partial<Keyframe>, saveToHistory = true) => {
        const newTracks = tracks.map((track) => {
            if (track.objectId === objectId) {
                return {
                    ...track,
                    keyframes: track.keyframes.map((k) =>
                        k.id === keyframeId ? { ...k, ...changes } : k
                    ),
                };
            }
            return track;
        });
        setTracks(newTracks);
        if (saveToHistory) {
            saveState(objects, newTracks);
        }
    };

    // Cubic Bezier Solver
    const solveCubicBezier = (t: number, p1x: number, p1y: number, p2x: number, p2y: number): number => {
        // Simple linear fallback for edge cases or if t is 0/1
        if (t === 0 || t === 1) return t;

        // Calculate x(t) and y(t) for cubic bezier with P0=(0,0) and P3=(1,1)
        // B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
        // Since P0=0 and P3=1:
        // x(t) = 3(1-t)^2 t x1 + 3(1-t) t^2 x2 + t^3
        // y(t) = 3(1-t)^2 t y1 + 3(1-t) t^2 y2 + t^3

        // We need to find T such that x(T) = time_ratio (which is passed as t here)
        // Then return y(T)

        // Newton-Raphson iteration to find T for a given x
        let x = t; // Initial guess
        for (let i = 0; i < 8; i++) {
            const currentX = 3 * Math.pow(1 - x, 2) * x * p1x + 3 * (1 - x) * Math.pow(x, 2) * p2x + Math.pow(x, 3);
            const error = currentX - t;
            if (Math.abs(error) < 0.001) break;

            const derivative = 3 * Math.pow(1 - x, 2) * p1x - 6 * (1 - x) * x * p1x + 6 * (1 - x) * x * p2x - 3 * Math.pow(x, 2) * p2x + 3 * Math.pow(x, 2);
            if (Math.abs(derivative) < 0.0001) break;
            x -= error / derivative;
        }

        // Clamp T
        const T = Math.max(0, Math.min(1, x));

        // Calculate Y at T
        return 3 * Math.pow(1 - T, 2) * T * p1y + 3 * (1 - T) * Math.pow(T, 2) * p2y + Math.pow(T, 3);
    };

    const getInterpolatedObjects = () => {
        return objects
            .filter(obj => {
                const start = obj.startTime ?? 0;
                const end = obj.endTime ?? Infinity;
                return currentTime >= start && currentTime <= end;
            })
            .map((obj) => {
                const track = tracks.find((t) => t.objectId === obj.id);
                if (!track || track.keyframes.length === 0) return obj;

                // Find surrounding keyframes
                const sortedKeyframes = [...track.keyframes].sort((a, b) => a.time - b.time);
                const nextKeyframeIndex = sortedKeyframes.findIndex((k) => k.time > currentTime);

                if (nextKeyframeIndex === -1) {
                    // After last keyframe, use last keyframe properties
                    const lastKeyframe = sortedKeyframes[sortedKeyframes.length - 1];
                    return { ...obj, ...lastKeyframe.properties };
                }

                if (nextKeyframeIndex === 0) {
                    // Before first keyframe, use first keyframe properties
                    const firstKeyframe = sortedKeyframes[0];
                    return { ...obj, ...firstKeyframe.properties };
                }

                const prevKeyframe = sortedKeyframes[nextKeyframeIndex - 1];
                const nextKeyframe = sortedKeyframes[nextKeyframeIndex];

                const duration = nextKeyframe.time - prevKeyframe.time;
                const elapsed = currentTime - prevKeyframe.time;
                let t = Math.min(1, Math.max(0, elapsed / duration));

                // Apply Easing
                if (prevKeyframe.easing) {
                    const match = prevKeyframe.easing.match(/cubic-bezier\(([\d.]+),\s*([\d.-]+),\s*([\d.]+),\s*([\d.-]+)\)/);
                    if (match) {
                        const p1x = parseFloat(match[1]);
                        const p1y = parseFloat(match[2]);
                        const p2x = parseFloat(match[3]);
                        const p2y = parseFloat(match[4]);
                        t = solveCubicBezier(t, p1x, p1y, p2x, p2y);
                    } else if (prevKeyframe.easing === 'ease-in') {
                        t = solveCubicBezier(t, 0.42, 0, 1, 1);
                    } else if (prevKeyframe.easing === 'ease-out') {
                        t = solveCubicBezier(t, 0, 0, 0.58, 1);
                    } else if (prevKeyframe.easing === 'ease-in-out') {
                        t = solveCubicBezier(t, 0.42, 0, 0.58, 1);
                    }
                }

                const interpolatedProps: Partial<CanvasObject> = {};

                // Interpolate numeric properties
                (['x', 'y', 'width', 'height', 'rotation', 'opacity', 'borderRadius', 'fontSize', 'lineHeight', 'letterSpacing'] as const).forEach((prop) => {
                    const start = (prevKeyframe.properties[prop] as number) ?? (obj[prop] as number);
                    const end = (nextKeyframe.properties[prop] as number) ?? (obj[prop] as number);
                    if (start !== undefined && end !== undefined) {
                        interpolatedProps[prop] = start + (end - start) * t;
                    }
                });

                // Snap string properties
                interpolatedProps.fill = prevKeyframe.properties.fill ?? obj.fill;
                interpolatedProps.fontFamily = prevKeyframe.properties.fontFamily ?? obj.fontFamily;
                interpolatedProps.fontWeight = prevKeyframe.properties.fontWeight ?? obj.fontWeight;
                interpolatedProps.fontStyle = prevKeyframe.properties.fontStyle ?? obj.fontStyle;
                interpolatedProps.textDecoration = prevKeyframe.properties.textDecoration ?? obj.textDecoration;
                interpolatedProps.textAlign = prevKeyframe.properties.textAlign ?? obj.textAlign;
                interpolatedProps.direction = prevKeyframe.properties.direction ?? obj.direction;

                return { ...obj, ...interpolatedProps };
            });
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const stop = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const splitObject = (id: string) => {
        const obj = objects.find((o) => o.id === id);
        if (!obj) return;

        const start = obj.startTime ?? 0;
        const end = obj.endTime ?? Infinity;

        // Can only split if current time is within object's lifespan
        if (currentTime <= start || currentTime >= end) return;

        // 1. Create new object
        const newId = crypto.randomUUID();
        const newObject: CanvasObject = {
            ...obj,
            id: newId,
            startTime: currentTime,
            endTime: end,
        };

        // 2. Update original object
        const updatedOriginalObject = {
            ...obj,
            endTime: currentTime,
        };

        // 3. Handle Tracks & Keyframes
        const originalTrack = tracks.find((t) => t.objectId === id);
        const originalKeyframes = originalTrack ? [...originalTrack.keyframes] : [];

        // Calculate current state to ensure continuity
        // We can reuse getInterpolatedObjects logic but for a specific object/time
        // For simplicity, let's just grab the current interpolated state from the 'objects' array
        // (since 'objects' in render is already interpolated if playing/scrubbing)
        // Wait, 'objects' state variable is the raw state. The interpolated state is returned by getInterpolatedObjects().
        // But inside this function, we have access to 'objects' state.
        // We need to calculate the interpolated properties at 'currentTime'.

        // Let's use a helper or just duplicate the interpolation logic briefly for the split point.
        // Actually, simpler: just let the user add a keyframe before splitting if they want exact control.
        // OR, better: The 'objects' returned by useCanvas() in the UI are interpolated. 
        // But here in the Context, 'objects' is the raw state.

        // Let's implement a simple split first: just distribute keyframes.
        // To fix the jump, we SHOULD add a keyframe at split point.
        // Let's try to find the interpolated values.

        // Hack: we can call getInterpolatedObjects() internally? 
        // No, it relies on 'objects' and 'tracks' state which we are modifying.
        // But we haven't modified them yet.

        const interpolatedList = getInterpolatedObjects();
        const interpolatedObj = interpolatedList.find(o => o.id === id);

        const splitKeyframe: Keyframe = {
            id: crypto.randomUUID(),
            time: currentTime,
            properties: {
                x: interpolatedObj?.x,
                y: interpolatedObj?.y,
                width: interpolatedObj?.width,
                height: interpolatedObj?.height,
                rotation: interpolatedObj?.rotation,
                opacity: interpolatedObj?.opacity,
                borderRadius: interpolatedObj?.borderRadius,
                fill: interpolatedObj?.fill,
                // Add other props as needed
            }
        };

        const keyframesBefore = originalKeyframes.filter(k => k.time <= currentTime);
        const keyframesAfter = originalKeyframes.filter(k => k.time > currentTime);

        // Add split keyframe to both to ensure continuity?
        // Actually, if we add it to 'before', the original object ends there.
        // If we add it to 'after', the new object starts there.
        // So yes, add to both.

        const newOriginalKeyframes = [...keyframesBefore, { ...splitKeyframe, id: crypto.randomUUID() }].sort((a, b) => a.time - b.time);
        const newNewKeyframes = [{ ...splitKeyframe, id: crypto.randomUUID() }, ...keyframesAfter].sort((a, b) => a.time - b.time);

        const newTracks = tracks.map(t => {
            if (t.objectId === id) {
                return { ...t, keyframes: newOriginalKeyframes };
            }
            return t;
        });
        newTracks.push({ objectId: newId, keyframes: newNewKeyframes });

        const newObjects = objects.map(o => o.id === id ? updatedOriginalObject : o);
        newObjects.push(newObject);

        setObjects(newObjects);
        setTracks(newTracks);
        setSelectedId(newId); // Select the new part
        saveState(newObjects, newTracks);
    };

    const saveHistory = () => {
        saveState(objects, tracks);
    };

    return (
        <CanvasContext.Provider
            value={{
                objects: isPlaying || currentTime > 0 ? getInterpolatedObjects() : objects,
                allObjects: objects, // Expose raw objects for Timeline
                selectedId,
                tracks,
                currentTime,
                isPlaying,
                addObject,
                updateObject,
                selectObject,
                addKeyframe,
                updateKeyframe,
                setCurrentTime,
                togglePlay,
                stop,
                undo,
                redo,
                canUndo: historyIndex > 0,
                canRedo: historyIndex < history.length - 1,
                saveHistory,
                splitObject
            }}
        >
            {children}
        </CanvasContext.Provider>
    );
}

export function useCanvas() {
    const context = useContext(CanvasContext);
    if (context === undefined) {
        throw new Error('useCanvas must be used within a CanvasProvider');
    }
    return context;
}
