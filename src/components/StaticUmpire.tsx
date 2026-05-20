import React from 'react';

interface StaticUmpireProps {
  width?: number;
  height?: number;
  className?: string;
  frameIndex?: number;
}

export const StaticUmpire: React.FC<StaticUmpireProps> = ({
  width = 80,
  height = 88, 
  className,
  frameIndex = 0
}) => {
  const spriteSheet = '/UmpireStrikeTransparent.png?v=3';
  const frameWidth = 704;
  const frameHeight = 768;
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
