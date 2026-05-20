import React from 'react';

interface StaticCatcherProps {
  width?: number;
  height?: number;
  className?: string;
  frameIndex?: number;
}

export const StaticCatcher: React.FC<StaticCatcherProps> = ({
  width = 70,
  height = 80, 
  className,
  frameIndex = 0
}) => {
  const spriteSheet = '/CatchingFramesTransparent.png';
  const frameWidth = 542;
  const frameHeight = 616;
  const cols = 4;
  const rows = 1;

  const col = frameIndex % cols;
  const row = Math.floor(frameIndex / cols);

  const scaleX = width / frameWidth;
  const scaleY = height / frameHeight;

  return (
    <div
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${spriteSheet})`,
        backgroundSize: `${frameWidth * cols * scaleX}px ${frameHeight * rows * scaleY}px`,
        backgroundPosition: `-${col * frameWidth * scaleX}px -${row * frameHeight * scaleY}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  );
};
