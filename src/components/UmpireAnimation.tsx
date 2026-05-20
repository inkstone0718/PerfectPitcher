import React from 'react';
import { SpriteAnimator } from './SpriteAnimator';

interface UmpireAnimationProps {
  isPlaying: boolean;
  type: 'strike' | 'ball';
  onAnimationEnd?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

export const UmpireAnimation: React.FC<UmpireAnimationProps> = ({
  isPlaying,
  type,
  onAnimationEnd,
  width = 80,
  height = 88,
  className
}) => {
  const frameWidth = 704;
  const frameHeight = 768;
  const totalFrames = 4;
  const frameDuration = 100; 

  const spriteSheet = type === 'strike' 
    ? '/UmpireStrikeTransparent.png?v=3' 
    : '/UmpireBallTransparent.png?v=3';

  // We add a key to force SpriteAnimator to reset when the type changes
  return (
    <SpriteAnimator
      key={type}
      spriteSheet={spriteSheet}
      frameWidth={frameWidth}
      frameHeight={frameHeight}
      totalFrames={totalFrames}
      frameDuration={frameDuration}
      isPlaying={isPlaying}
      columns={4}
      width={width}
      height={height}
      onEnd={onAnimationEnd}
      className={className}
    />
  );
};
