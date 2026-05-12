import React, { useEffect, useRef } from 'react';

interface StaticPitcherProps {
  size?: number;
  className?: string;
  frameIndex?: number; // Default to frame 2 (index 1)
}

export const StaticPitcher: React.FC<StaticPitcherProps> = ({
  size = 80,
  className,
  frameIndex = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/PitchingFrames.png';
    
    const drawImage = () => {
      if (img.complete) {
        drawFrame(img, frameIndex);
      }
    };
    
    img.onload = drawImage;
    img.onerror = () => {
      console.error('Failed to load PitchingFrames.png in StaticPitcher');
    };
    
    // Also try drawing immediately if image is already cached
    if (img.complete) {
      drawImage();
    }
  }, [frameIndex]);

  const drawFrame = (img: HTMLImageElement, frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Frame dimensions
    const frameWidth = 704;
    const frameHeight = 384;
    const cols = 4;

    // Calculate source position
    const sourceX = (frameIdx % cols) * frameWidth;
    const sourceY = Math.floor(frameIdx / cols) * frameHeight;

    // Draw the frame
    ctx.drawImage(
      img,
      sourceX, sourceY, frameWidth, frameHeight,
      0, 0, size, size
    );
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};
