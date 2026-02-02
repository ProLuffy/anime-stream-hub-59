import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  X, Layers, Image as ImageIcon, Type, Eye, EyeOff, Lock, Unlock,
  RotateCcw, Save, Upload, Search, Sparkles, Grid, Trash2,
  Move, ZoomIn, ZoomOut, RotateCw, Sliders, Palette, AlignCenter
} from 'lucide-react';
import { toast } from 'sonner';

interface ThumbnailStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (thumbnailData: string) => void;
}

interface Layer {
  id: string;
  name: string;
  type: 'background' | 'image' | 'text' | 'badge' | 'overlay';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blur: number;
  scale: number;
  rotation: number;
  x: number;
  y: number;
  // Type-specific
  src?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadow?: boolean;
}

const FONTS = [
  { name: 'Anime Ace', value: 'Impact, sans-serif' },
  { name: 'Bold Sans', value: 'Arial Black, sans-serif' },
  { name: 'Clean', value: 'Helvetica, sans-serif' },
  { name: 'Dramatic', value: 'Georgia, serif' },
  { name: 'Modern', value: 'Verdana, sans-serif' },
];

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#FF6B00', '#FFD700', 
  '#00FF00', '#00FFFF', '#0088FF', '#8B00FF', '#FF00FF',
];

export default function ThumbnailStudio({ isOpen, onClose, onSave }: ThumbnailStudioProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'bg',
      name: 'Background',
      type: 'background',
      visible: true,
      locked: false,
      opacity: 100,
      blur: 0,
      scale: 100,
      rotation: 0,
      x: 0,
      y: 0,
      src: '',
    },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [imageSource, setImageSource] = useState<'upload' | 'search' | 'ai' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'layers' | 'properties'>('layers');
  
  // Effects state
  const [effects, setEffects] = useState({
    vignette: false,
    glow: false,
    gradient: false,
    grain: false,
  });

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const addLayer = (type: Layer['type'], data?: Partial<Layer>) => {
    const newLayer: Layer = {
      id: crypto.randomUUID(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${layers.length}`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      blur: 0,
      scale: 100,
      rotation: 0,
      x: 50,
      y: 50,
      ...data,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLayer = (id: string) => {
    if (id === 'bg') return; // Can't delete background
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        if (selectedLayerId) {
          updateLayer(selectedLayerId, { src });
        } else {
          addLayer('image', { src, name: file.name });
        }
        setImageSource(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTextLayer = () => {
    addLayer('text', {
      name: 'Title Text',
      text: 'Episode Title',
      fontSize: 48,
      fontFamily: 'Impact, sans-serif',
      color: '#FFFFFF',
      strokeColor: '#000000',
      strokeWidth: 2,
      shadow: true,
    });
  };

  const addBadgeLayer = (badgeType: string) => {
    addLayer('badge', {
      name: badgeType,
      text: badgeType,
      fontSize: 24,
      color: badgeType === 'NEW' ? '#00FF00' : badgeType === 'DUB' ? '#FF6B00' : '#FFD700',
    });
  };

  const handleSave = () => {
    // In a real implementation, this would use html2canvas or similar
    toast.success('Thumbnail saved!');
    onSave('thumbnail-data');
    onClose();
  };

  const handleReset = () => {
    setLayers([{
      id: 'bg',
      name: 'Background',
      type: 'background',
      visible: true,
      locked: false,
      opacity: 100,
      blur: 0,
      scale: 100,
      rotation: 0,
      x: 0,
      y: 0,
      src: '',
    }]);
    setSelectedLayerId(null);
    setEffects({ vignette: false, glow: false, gradient: false, grain: false });
    toast.info('Canvas reset');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background"
        >
          {/* Top Bar */}
          <div className="h-14 border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold">Thumbnail Studio</h1>
              <span className="text-sm text-muted-foreground">1280 × 720</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                title="Toggle Grid"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={!layers.some(l => l.src || l.text)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Thumbnail
              </button>
            </div>
          </div>

          <div className="flex h-[calc(100vh-3.5rem)]">
            {/* Left Panel - Layers */}
            <div className="w-64 border-r border-border flex flex-col">
              <div className="p-3 border-b border-border flex gap-2">
                <button
                  onClick={() => setActiveTab('layers')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    activeTab === 'layers' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  }`}
                >
                  Layers
                </button>
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    activeTab === 'properties' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  }`}
                >
                  Properties
                </button>
              </div>

              {activeTab === 'layers' ? (
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  <Reorder.Group values={layers} onReorder={setLayers}>
                    {[...layers].reverse().map(layer => (
                      <Reorder.Item key={layer.id} value={layer}>
                        <motion.div
                          onClick={() => !layer.locked && setSelectedLayerId(layer.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                            selectedLayerId === layer.id ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-secondary'
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLayer(layer.id, { visible: !layer.visible });
                            }}
                            className="p-1 hover:bg-secondary/50 rounded"
                          >
                            {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                          </button>
                          <span className={`flex-1 text-sm truncate ${!layer.visible ? 'text-muted-foreground' : ''}`}>
                            {layer.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLayer(layer.id, { locked: !layer.locked });
                            }}
                            className="p-1 hover:bg-secondary/50 rounded"
                          >
                            {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                          </button>
                          {layer.id !== 'bg' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLayer(layer.id);
                              }}
                              className="p-1 hover:bg-red-500/20 rounded text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              ) : (
                selectedLayer && (
                  <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground">Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedLayer.opacity}
                        onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Blur</label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={selectedLayer.blur}
                        onChange={(e) => updateLayer(selectedLayer.id, { blur: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Scale</label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={selectedLayer.scale}
                        onChange={(e) => updateLayer(selectedLayer.id, { scale: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Rotation</label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={selectedLayer.rotation}
                        onChange={(e) => updateLayer(selectedLayer.id, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    
                    {selectedLayer.type === 'text' && (
                      <>
                        <div>
                          <label className="text-xs text-muted-foreground">Text</label>
                          <input
                            type="text"
                            value={selectedLayer.text || ''}
                            onChange={(e) => updateLayer(selectedLayer.id, { text: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-secondary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Font</label>
                          <select
                            value={selectedLayer.fontFamily}
                            onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-secondary"
                          >
                            {FONTS.map(f => (
                              <option key={f.value} value={f.value}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Font Size</label>
                          <input
                            type="number"
                            min="12"
                            max="120"
                            value={selectedLayer.fontSize}
                            onChange={(e) => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg bg-secondary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Color</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {PRESET_COLORS.map(c => (
                              <button
                                key={c}
                                onClick={() => updateLayer(selectedLayer.id, { color: c })}
                                className={`w-6 h-6 rounded border-2 ${selectedLayer.color === c ? 'border-primary' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              )}

              {/* Add Layer Buttons */}
              <div className="p-3 border-t border-border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setImageSource('upload')}
                    className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm flex items-center gap-2 justify-center"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  <button
                    onClick={() => setImageSource('search')}
                    className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm flex items-center gap-2 justify-center"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                  <button
                    onClick={addTextLayer}
                    className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm flex items-center gap-2 justify-center"
                  >
                    <Type className="w-4 h-4" />
                    Text
                  </button>
                  <button
                    onClick={() => setImageSource('ai')}
                    className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm flex items-center gap-2 justify-center"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI
                  </button>
                </div>
                
                <div className="flex gap-2">
                  {['NEW', 'DUB', 'EP'].map(badge => (
                    <button
                      key={badge}
                      onClick={() => addBadgeLayer(badge)}
                      className="flex-1 p-1.5 rounded text-xs font-bold bg-secondary hover:bg-secondary/80"
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 p-8 flex items-center justify-center bg-muted/30 overflow-auto">
              <div
                ref={canvasRef}
                className="relative bg-black rounded-lg shadow-2xl overflow-hidden"
                style={{ width: 640, height: 360, aspectRatio: '16/9' }}
              >
                {/* Grid Overlay */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 pointer-events-none z-50"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                )}

                {/* Layers */}
                {layers.filter(l => l.visible).map(layer => (
                  <div
                    key={layer.id}
                    className={`absolute ${selectedLayerId === layer.id ? 'ring-2 ring-primary' : ''}`}
                    style={{
                      opacity: layer.opacity / 100,
                      filter: `blur(${layer.blur}px)`,
                      transform: `translate(-50%, -50%) scale(${layer.scale / 100}) rotate(${layer.rotation}deg)`,
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      ...(layer.type === 'background' ? { inset: 0, left: 0, top: 0, transform: 'none' } : {}),
                    }}
                  >
                    {(layer.type === 'background' || layer.type === 'image') && layer.src && (
                      <img src={layer.src} alt="" className="w-full h-full object-cover" />
                    )}
                    {layer.type === 'text' && (
                      <span
                        style={{
                          fontFamily: layer.fontFamily,
                          fontSize: (layer.fontSize || 48) * 0.5,
                          color: layer.color,
                          WebkitTextStroke: layer.strokeWidth ? `${layer.strokeWidth}px ${layer.strokeColor}` : undefined,
                          textShadow: layer.shadow ? '2px 2px 4px rgba(0,0,0,0.8)' : undefined,
                        }}
                        className="whitespace-nowrap font-bold"
                      >
                        {layer.text}
                      </span>
                    )}
                    {layer.type === 'badge' && (
                      <span
                        className="px-2 py-1 rounded font-bold text-sm"
                        style={{
                          backgroundColor: layer.color,
                          color: '#000',
                        }}
                      >
                        {layer.text}
                      </span>
                    )}
                  </div>
                ))}

                {/* Effects */}
                {effects.vignette && (
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
                )}
                {effects.gradient && (
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                )}
                {effects.grain && (
                  <div className="absolute inset-0 pointer-events-none opacity-10 bg-noise" />
                )}

                {/* Empty State */}
                {!layers.some(l => l.src || l.text) && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Add images or text to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Effects */}
            <div className="w-56 border-l border-border p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Effects
              </h3>
              
              <div className="space-y-3">
                {[
                  { key: 'vignette', label: 'Vignette' },
                  { key: 'glow', label: 'Soft Glow' },
                  { key: 'gradient', label: 'Gradient Mask' },
                  { key: 'grain', label: 'Film Grain' },
                ].map(effect => (
                  <label key={effect.key} className="flex items-center justify-between">
                    <span className="text-sm">{effect.label}</span>
                    <button
                      onClick={() => setEffects(e => ({ ...e, [effect.key]: !e[effect.key as keyof typeof e] }))}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        effects[effect.key as keyof typeof effects] ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        effects[effect.key as keyof typeof effects] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Image Source Modal */}
          <AnimatePresence>
            {imageSource && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4"
                onClick={() => setImageSource(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-md bg-card rounded-2xl p-6"
                >
                  {imageSource === 'upload' && (
                    <>
                      <h3 className="text-lg font-bold mb-4">Upload Image</h3>
                      <label className="block p-8 border-2 border-dashed border-border rounded-xl text-center cursor-pointer hover:border-primary transition-colors">
                        <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                        <p>Click to upload or drag & drop</p>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </>
                  )}
                  
                  {imageSource === 'search' && (
                    <>
                      <h3 className="text-lg font-bold mb-4">Search Images</h3>
                      <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search anime screenshots..."
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary outline-none"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Search functionality would connect to image API
                      </p>
                    </>
                  )}
                  
                  {imageSource === 'ai' && (
                    <>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        AI Image Generator
                      </h3>
                      <input
                        type="text"
                        placeholder="Describe your image..."
                        className="w-full px-4 py-3 rounded-xl bg-secondary outline-none mb-4"
                      />
                      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
                        Generate with AI
                      </button>
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        Powered by AI image generation
                      </p>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
