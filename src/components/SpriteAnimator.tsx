import React, { useEffect, useRef, useState } from 'react';

interface SpriteAnimatorProps {
  spriteSheet: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  frameDuration: number;
  isPlaying: boolean;
  className?: string;
  style?: React.CSSProperties;
  onEnd?: () => void;
}

export const SpriteAnimator: React.FC<SpriteAnimatorProps> = ({
  spriteSheet,
  frameWidth,
  frameHeight,
  totalFrames,
  frameDuration,
  isPlaying,
  className,
  style,
  onEnd
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = spriteSheet;
    img.onload = () => {
      imageRef.current = img;
      drawFrame(0);
    };
  }, [spriteSheet]);

  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, frameWidth, frameHeight);

    // Calculate source position (assuming frames are arranged horizontally)
    const columns = Math.ceil(Math.sqrt(totalFrames));
    const sourceX = (frameIndex % columns) * frameWidth;
    const sourceY = Math.floor(frameIndex / columns) * frameHeight;

    // Draw the specific frame
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth,
      frameHeight
    );
  };

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const frameIndex = Math.floor(elapsed / frameDuration) % totalFrames;
      
      if (frameIndex !== currentFrame) {
        setCurrentFrame(frameIndex);
        drawFrame(frameIndex);
        
        // Check if animation completed - end on last frame (15 for 16 frames)
        if (frameIndex === totalFrames - 1) {
          onEnd?.();
          // Stop animation by not calling requestAnimationFrame again
          return;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, frameDuration, totalFrames, onEnd]);

  return (
    <canvas
      ref={canvasRef}
      width={frameWidth}
      height={frameHeight}
      className={className}
      style={style}
    />
  );
};
