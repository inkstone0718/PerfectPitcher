import React, { useEffect, useRef, useState } from 'react';

interface SpriteAnimatorProps {
  spriteSheet: string;
  frameWidth: number;   // Original frame width in pixels
  frameHeight: number;  // Original frame height in pixels
  totalFrames: number;
  frameDuration: number | number[]; // Support array of durations
  isPlaying: boolean;
  width: number;        // Display width
  height: number;       // Display height
  columns: number;
  className?: string;
  onEnd?: () => void;
}

export const SpriteAnimator: React.FC<SpriteAnimatorProps> = ({
  spriteSheet,
  frameWidth,
  frameHeight,
  totalFrames,
  frameDuration,
  isPlaying,
  width,
  height,
  columns,
  className,
  onEnd
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const timerRef = useRef<number | null>(null);
  const onEndRef = useRef(onEnd);

  // Keep onEndRef in sync with the latest onEnd callback
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  // Create a stable string representation for the duration if it's an array
  const durationKey = Array.isArray(frameDuration)
    ? frameDuration.join(',')
    : String(frameDuration);

  useEffect(() => {
    if (!isPlaying) {
      setCurrentFrame(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const durations = Array.isArray(frameDuration)
      ? frameDuration
      : Array(totalFrames).fill(frameDuration);

    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const minDuration = Math.min(...durations);

    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      
      let frameIndex = 0;
      let accumulated = 0;
      for (let i = 0; i < totalFrames; i++) {
        accumulated += durations[i];
        if (elapsed < accumulated) {
          frameIndex = i;
          break;
        }
        if (i === totalFrames - 1) {
          frameIndex = totalFrames - 1;
        }
      }
      
      if (elapsed >= totalDuration) {
        setCurrentFrame(totalFrames - 1);
        onEndRef.current?.();
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      setCurrentFrame(frameIndex);
    };

    timerRef.current = window.setInterval(tick, Math.max(10, minDuration / 2));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, durationKey, totalFrames]);

  const rows = Math.ceil(totalFrames / columns);
  const col = currentFrame % columns;
  const row = Math.floor(currentFrame / columns);

  // Scaling factor for background-size and position
  const scaleX = width / frameWidth;
  const scaleY = height / frameHeight;

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${spriteSheet})`,
        backgroundSize: `${frameWidth * columns * scaleX}px ${frameHeight * rows * scaleY}px`,
        backgroundPosition: `-${col * frameWidth * scaleX}px -${row * frameHeight * scaleY}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  );
};
