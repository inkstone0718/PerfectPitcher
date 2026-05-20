import React from 'react';

interface StaticBatterProps {
  width?: number;
  height?: number;
  className?: string;
  frameIndex?: number;
}

export const StaticBatter: React.FC<StaticBatterProps> = ({
  width = 80,
  height = 88, 
  className,
  frameIndex = 0
}) => {
  const spriteSheet = '/BattingFramesTransparent.png';
  const frameWidth = 703;
  const frameHeight = 768;
  const cols = 4;
  const rows = 2;

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
