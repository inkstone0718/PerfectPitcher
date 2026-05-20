import React from 'react';
import { SpriteAnimator } from './SpriteAnimator';

interface BattingAnimationProps {
  isPlaying: boolean;
  onAnimationEnd?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

export const BattingAnimation: React.FC<BattingAnimationProps> = ({
  isPlaying,
  onAnimationEnd,
  width = 80,
  height = 88,
  className
}) => {
  const frameWidth = 703;
  const frameHeight = 768;
  const totalFrames = 8;
  const frameDuration = 50; 

  return (
    <SpriteAnimator
      spriteSheet="/BattingFramesTransparent.png"
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
