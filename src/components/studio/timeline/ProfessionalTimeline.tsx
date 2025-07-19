import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Square,
  RotateCcw,
  Settings,
  Download,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Copy,
  Trash2,
  Plus,
  Zap,
  Camera,
  Move3D,
  Palette,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { TimelineTrack } from './TimelineTrack';
import { KeyframeEditor } from './KeyframeEditor';
import { AnimationPresets } from './AnimationPresets';
import { ExportPanel } from './ExportPanel';

export type AnimationMode = 'beginner' | 'pro' | 'director';
export type PlaybackState = 'playing' | 'paused' | 'stopped';
export type TrackType = 'camera' | 'transform' | 'material' | 'lighting' | 'effects';

export interface Keyframe {
  id: string;
  time: number;
  value: number | number[] | string;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  interpolation: 'linear' | 'cubic' | 'step';
  tangentIn?: { x: number; y: number };
  tangentOut?: { x: number; y: number };
}

export interface AnimationProperty {
  id: string;
  name: string;
  type: string;
  keyframes: Keyframe[];
  value: number | number[] | string;
  min?: number;
  max?: number;
  step?: number;
}

export interface AnimationTrack {
  id: string;
  name: string;
  type: TrackType;
  expanded: boolean;
  visible: boolean;
  locked: boolean;
  muted: boolean;
  color: string;
  properties: AnimationProperty[];
}

export interface TimelineState {
  currentTime: number;
  duration: number;
  playbackState: PlaybackState;
  zoom: number;
  tracks: AnimationTrack[];
  selectedKeyframes: string[];
  selectedTracks: string[];
  clipboard: Keyframe[];
  onionSkinning: boolean;
  motionBlur: boolean;
  frameRate: number;
}

interface ProfessionalTimelineProps {
  mode?: AnimationMode;
  onAnimationUpdate?: (state: TimelineState) => void;
  onExport?: (format: string, options: any) => void;
}

export const ProfessionalTimeline: React.FC<ProfessionalTimelineProps> = ({
  mode = 'pro',
  onAnimationUpdate,
  onExport
}) => {
  const [timelineState, setTimelineState] = useState<TimelineState>({
    currentTime: 0,
    duration: 10,
    playbackState: 'paused',
    zoom: 1,
    tracks: [
      {
        id: 'camera-track',
        name: 'Camera',
        type: 'camera',
        expanded: true,
        visible: true,
        locked: false,
        muted: false,
        color: '#3b82f6',
        properties: [
          {
            id: 'camera-position-x',
            name: 'Position X',
            type: 'number',
            keyframes: [
              { id: 'kf1', time: 0, value: 0, easing: 'ease-in-out', interpolation: 'cubic' },
              { id: 'kf2', time: 5, value: 3, easing: 'ease-in-out', interpolation: 'cubic' }
            ],
            value: 0,
            min: -10,
            max: 10,
            step: 0.1
          },
          {
            id: 'camera-fov',
            name: 'Field of View',
            type: 'number',
            keyframes: [
              { id: 'kf3', time: 0, value: 50, easing: 'linear', interpolation: 'linear' },
              { id: 'kf4', time: 8, value: 35, easing: 'ease-out', interpolation: 'cubic' }
            ],
            value: 50,
            min: 10,
            max: 120,
            step: 1
          }
        ]
      },
      {
        id: 'transform-track',
        name: 'Card Transform',
        type: 'transform',
        expanded: false,
        visible: true,
        locked: false,
        muted: false,
        color: '#10b981',
        properties: [
          {
            id: 'rotation-y',
            name: 'Rotation Y',
            type: 'number',
            keyframes: [
              { id: 'kf5', time: 2, value: 0, easing: 'ease-in-out', interpolation: 'cubic' },
              { id: 'kf6', time: 6, value: 360, easing: 'ease-in-out', interpolation: 'cubic' }
            ],
            value: 0,
            min: -360,
            max: 360,
            step: 1
          }
        ]
      },
      {
        id: 'material-track',
        name: 'Materials',
        type: 'material',
        expanded: false,
        visible: true,
        locked: false,
        muted: false,
        color: '#f59e0b',
        properties: [
          {
            id: 'opacity',
            name: 'Opacity',
            type: 'number',
            keyframes: [
              { id: 'kf7', time: 0, value: 0, easing: 'ease-in', interpolation: 'cubic' },
              { id: 'kf8', time: 1, value: 1, easing: 'ease-out', interpolation: 'cubic' }
            ],
            value: 1,
            min: 0,
            max: 1,
            step: 0.01
          }
        ]
      }
    ],
    selectedKeyframes: [],
    selectedTracks: [],
    clipboard: [],
    onionSkinning: false,
    motionBlur: false,
    frameRate: 60
  });

  const [showKeyframeEditor, setShowKeyframeEditor] = useState(false);
  const [showAnimationPresets, setShowAnimationPresets] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [playbackLoop, setPlaybackLoop] = useState(false);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const playbackRef = useRef<number | null>(null);

  // Playback controls
  const play = useCallback(() => {
    if (timelineState.playbackState === 'playing') return;
    
    setTimelineState(prev => ({ ...prev, playbackState: 'playing' }));
    
    const startTime = performance.now() - (timelineState.currentTime * 1000);
    
    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      
      if (elapsed >= timelineState.duration) {
        if (playbackLoop) {
          setTimelineState(prev => ({ ...prev, currentTime: 0 }));
          play();
        } else {
          pause();
        }
        return;
      }
      
      setTimelineState(prev => ({ ...prev, currentTime: elapsed }));
      playbackRef.current = requestAnimationFrame(animate);
    };
    
    playbackRef.current = requestAnimationFrame(animate);
  }, [timelineState.playbackState, timelineState.currentTime, timelineState.duration, playbackLoop]);

  const pause = useCallback(() => {
    if (playbackRef.current) {
      cancelAnimationFrame(playbackRef.current);
      playbackRef.current = null;
    }
    setTimelineState(prev => ({ ...prev, playbackState: 'paused' }));
  }, []);

  const stop = useCallback(() => {
    pause();
    setTimelineState(prev => ({ ...prev, currentTime: 0, playbackState: 'stopped' }));
  }, [pause]);

  const seek = useCallback((time: number) => {
    setTimelineState(prev => ({
      ...prev,
      currentTime: Math.max(0, Math.min(time, prev.duration))
    }));
  }, []);

  // Track management
  const toggleTrackExpansion = useCallback((trackId: string) => {
    setTimelineState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId ? { ...track, expanded: !track.expanded } : track
      )
    }));
  }, []);

  const toggleTrackVisibility = useCallback((trackId: string) => {
    setTimelineState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId ? { ...track, visible: !track.visible } : track
      )
    }));
  }, []);

  const toggleTrackLock = useCallback((trackId: string) => {
    setTimelineState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId ? { ...track, locked: !track.locked } : track
      )
    }));
  }, []);

  // Keyframe management
  const addKeyframe = useCallback((propertyId: string, time: number, value: any) => {
    const newKeyframe: Keyframe = {
      id: `kf-${Date.now()}-${Math.random()}`,
      time,
      value,
      easing: 'ease-in-out',
      interpolation: 'cubic'
    };

    setTimelineState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        properties: track.properties.map(property =>
          property.id === propertyId
            ? { ...property, keyframes: [...property.keyframes, newKeyframe].sort((a, b) => a.time - b.time) }
            : property
        )
      }))
    }));
  }, []);

  const deleteKeyframe = useCallback((propertyId: string, keyframeId: string) => {
    setTimelineState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        properties: track.properties.map(property =>
          property.id === propertyId
            ? { ...property, keyframes: property.keyframes.filter(kf => kf.id !== keyframeId) }
            : property
        )
      }))
    }));
  }, []);

  const copyKeyframes = useCallback(() => {
    const selected = timelineState.selectedKeyframes;
    const keyframesToCopy: Keyframe[] = [];
    
    timelineState.tracks.forEach(track => {
      track.properties.forEach(property => {
        property.keyframes.forEach(keyframe => {
          if (selected.includes(keyframe.id)) {
            keyframesToCopy.push({ ...keyframe });
          }
        });
      });
    });
    
    setTimelineState(prev => ({ ...prev, clipboard: keyframesToCopy }));
  }, [timelineState.selectedKeyframes, timelineState.tracks]);

  const pasteKeyframes = useCallback((propertyId: string, time: number) => {
    if (timelineState.clipboard.length === 0) return;
    
    const baseTime = timelineState.clipboard[0].time;
    const newKeyframes = timelineState.clipboard.map(kf => ({
      ...kf,
      id: `kf-${Date.now()}-${Math.random()}`,
      time: time + (kf.time - baseTime)
    }));

    setTimelineState(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => ({
        ...track,
        properties: track.properties.map(property =>
          property.id === propertyId
            ? { 
                ...property, 
                keyframes: [...property.keyframes, ...newKeyframes].sort((a, b) => a.time - b.time) 
              }
            : property
        )
      }))
    }));
  }, [timelineState.clipboard]);

  // Animation evaluation
  const evaluateProperty = useCallback((property: AnimationProperty, time: number): number | number[] | string => {
    if (property.keyframes.length === 0) return property.value;
    if (property.keyframes.length === 1) return property.keyframes[0].value;

    // Find surrounding keyframes
    let prevKf = property.keyframes[0];
    let nextKf = property.keyframes[property.keyframes.length - 1];

    for (let i = 0; i < property.keyframes.length - 1; i++) {
      if (time >= property.keyframes[i].time && time <= property.keyframes[i + 1].time) {
        prevKf = property.keyframes[i];
        nextKf = property.keyframes[i + 1];
        break;
      }
    }

    if (time <= prevKf.time) return prevKf.value;
    if (time >= nextKf.time) return nextKf.value;

    // Interpolate between keyframes
    const t = (time - prevKf.time) / (nextKf.time - prevKf.time);
    const easedT = applyEasing(t, prevKf.easing);

    if (typeof prevKf.value === 'number' && typeof nextKf.value === 'number') {
      return prevKf.value + (nextKf.value - prevKf.value) * easedT;
    }

    return prevKf.value;
  }, []);

  const applyEasing = (t: number, easing: string): number => {
    switch (easing) {
      case 'linear': return t;
      case 'ease-in': return t * t;
      case 'ease-out': return 1 - (1 - t) * (1 - t);
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'bounce': return 1 - Math.pow(1 - t, 3) * Math.abs(Math.cos(t * Math.PI * 3.5));
      case 'elastic': return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
      default: return t;
    }
  };

  // Get track icon
  const getTrackIcon = (type: TrackType) => {
    switch (type) {
      case 'camera': return Camera;
      case 'transform': return Move3D;
      case 'material': return Palette;
      case 'lighting': return Lightbulb;
      case 'effects': return Sparkles;
      default: return Settings;
    }
  };

  // Timeline grid calculation
  const timelineWidth = timelineState.duration * 100 * timelineState.zoom;
  const gridLines = [];
  const step = timelineState.zoom > 2 ? 0.1 : timelineState.zoom > 1 ? 0.5 : 1;
  
  for (let i = 0; i <= timelineState.duration; i += step) {
    gridLines.push(i);
  }

  // Update parent component
  useEffect(() => {
    onAnimationUpdate?.(timelineState);
  }, [timelineState, onAnimationUpdate]);

  return (
    <div className="h-full bg-crd-dark border-t border-crd-border flex flex-col">
      {/* Timeline Header */}
      <div className="h-12 bg-crd-darkest border-b border-crd-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => seek(0)}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={timelineState.playbackState === 'playing' ? pause : play}
            >
              {timelineState.playbackState === 'playing' ? 
                <Pause className="w-4 h-4" /> : 
                <Play className="w-4 h-4" />
              }
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={stop}>
              <Square className="w-3 h-3" />
            </Button>
            <Button 
              variant={playbackLoop ? "default" : "ghost"} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setPlaybackLoop(!playbackLoop)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Time Display */}
          <div className="flex items-center gap-2 text-sm">
            <span className="w-16 text-crd-text-secondary">
              {timelineState.currentTime.toFixed(2)}s
            </span>
            <span className="text-crd-text-secondary">/</span>
            <span className="w-16 text-crd-text-secondary">
              {timelineState.duration.toFixed(2)}s
            </span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Frame Rate */}
          <Select value={timelineState.frameRate.toString()} onValueChange={(value) => 
            setTimelineState(prev => ({ ...prev, frameRate: parseInt(value) }))
          }>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24fps</SelectItem>
              <SelectItem value="30">30fps</SelectItem>
              <SelectItem value="60">60fps</SelectItem>
              <SelectItem value="120">120fps</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Advanced Options */}
          <Button
            variant={timelineState.onionSkinning ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setTimelineState(prev => ({ ...prev, onionSkinning: !prev.onionSkinning }))}
          >
            Onion Skin
          </Button>
          
          <Button
            variant={timelineState.motionBlur ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setTimelineState(prev => ({ ...prev, motionBlur: !prev.motionBlur }))}
          >
            Motion Blur
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Panel Toggles */}
          <Button
            variant={showAnimationPresets ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setShowAnimationPresets(!showAnimationPresets)}
          >
            <Zap className="w-4 h-4 mr-1" />
            Presets
          </Button>
          
          <Button
            variant={showKeyframeEditor ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setShowKeyframeEditor(!showKeyframeEditor)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Curves
          </Button>
          
          <Button
            variant={showExportPanel ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setShowExportPanel(!showExportPanel)}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className="flex-1 flex">
        {/* Track List */}
        <div className="w-64 bg-crd-dark border-r border-crd-border">
          <div className="p-2 space-y-1">
            {timelineState.tracks.map((track) => {
              const Icon = getTrackIcon(track.type);
              return (
                <div key={track.id} className="space-y-1">
                  {/* Track Header */}
                  <div className="flex items-center gap-1 p-2 rounded-sm hover:bg-crd-darkest group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => toggleTrackExpansion(track.id)}
                    >
                      {track.expanded ? 
                        <ChevronDown className="w-3 h-3" /> : 
                        <ChevronRight className="w-3 h-3" />
                      }
                    </Button>
                    
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: track.color }}
                    />
                    
                    <Icon className="w-4 h-4" />
                    
                    <span className="text-sm flex-1">{track.name}</span>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => toggleTrackVisibility(track.id)}
                      >
                        {track.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => toggleTrackLock(track.id)}
                      >
                        {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>

                  {/* Properties */}
                  {track.expanded && (
                    <div className="ml-4 space-y-1">
                      {track.properties.map((property) => (
                        <div key={property.id} className="flex items-center gap-2 p-1 text-xs text-crd-text-secondary hover:bg-crd-darkest rounded-sm">
                          <span className="flex-1">{property.name}</span>
                          <span className="w-16 text-right">
                            {typeof property.value === 'number' ? property.value.toFixed(2) : property.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Canvas */}
        <div className="flex-1 relative overflow-auto" ref={timelineRef}>
          {/* Time Ruler */}
          <div className="h-8 bg-crd-darkest border-b border-crd-border relative">
            <div 
              className="relative h-full"
              style={{ width: `${timelineWidth}px` }}
            >
              {gridLines.map((time) => (
                <div
                  key={time}
                  className="absolute top-0 h-full flex flex-col justify-between text-xs text-crd-text-secondary"
                  style={{ left: `${time * 100 * timelineState.zoom}px` }}
                >
                  <div className="w-px h-2 bg-crd-border" />
                  <span className="px-1">{time.toFixed(1)}s</span>
                </div>
              ))}
              
              {/* Playhead */}
              <div
                className="absolute top-0 w-px h-full bg-crd-accent z-10"
                style={{ left: `${timelineState.currentTime * 100 * timelineState.zoom}px` }}
              >
                <div className="absolute -top-1 -left-2 w-4 h-4 bg-crd-accent transform rotate-45" />
              </div>
            </div>
          </div>

          {/* Track Lanes */}
          <div className="space-y-1 p-1">
            {timelineState.tracks.map((track) => (
              <TimelineTrack
                key={track.id}
                track={track}
                currentTime={timelineState.currentTime}
                duration={timelineState.duration}
                zoom={timelineState.zoom}
                selectedKeyframes={timelineState.selectedKeyframes}
                onKeyframeSelect={(keyframeIds) => 
                  setTimelineState(prev => ({ ...prev, selectedKeyframes: keyframeIds }))
                }
                onKeyframeMove={(propertyId, keyframeId, newTime) => {
                  setTimelineState(prev => ({
                    ...prev,
                    tracks: prev.tracks.map(t => ({
                      ...t,
                      properties: t.properties.map(p =>
                        p.id === propertyId
                          ? {
                              ...p,
                              keyframes: p.keyframes.map(kf =>
                                kf.id === keyframeId ? { ...kf, time: newTime } : kf
                              )
                            }
                          : p
                      )
                    }))
                  }));
                }}
                onAddKeyframe={addKeyframe}
                onDeleteKeyframe={deleteKeyframe}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Panels */}
      {showKeyframeEditor && (
        <KeyframeEditor
          selectedKeyframes={timelineState.selectedKeyframes}
          tracks={timelineState.tracks}
          onKeyframeUpdate={(keyframeId, updates) => {
            setTimelineState(prev => ({
              ...prev,
              tracks: prev.tracks.map(track => ({
                ...track,
                properties: track.properties.map(property => ({
                  ...property,
                  keyframes: property.keyframes.map(kf =>
                    kf.id === keyframeId ? { ...kf, ...updates } : kf
                  )
                }))
              }))
            }));
          }}
          onClose={() => setShowKeyframeEditor(false)}
        />
      )}

      {showAnimationPresets && (
        <AnimationPresets
          mode={mode}
          onApplyPreset={(preset) => {
            // Apply animation preset logic here
            console.log('Applying preset:', preset);
          }}
          onClose={() => setShowAnimationPresets(false)}
        />
      )}

      {showExportPanel && (
        <ExportPanel
          duration={timelineState.duration}
          frameRate={timelineState.frameRate}
          onExport={(format, options) => {
            onExport?.(format, options);
            setShowExportPanel(false);
          }}
          onClose={() => setShowExportPanel(false)}
        />
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4">
        <Card className="bg-black/80 backdrop-blur-sm border-white/10 p-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">Zoom:</span>
            <Slider
              value={[timelineState.zoom]}
              onValueChange={([value]) => setTimelineState(prev => ({ ...prev, zoom: value }))}
              min={0.1}
              max={5}
              step={0.1}
              className="w-20"
            />
            <span className="text-xs text-white/50 w-8">
              {timelineState.zoom.toFixed(1)}x
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};