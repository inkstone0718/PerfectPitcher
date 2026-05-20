import React from 'react';
import { SpriteAnimator } from './SpriteAnimator';

interface CatchingAnimationProps {
  isPlaying: boolean;
  onAnimationEnd?: () => void;
  width?: number;
  height?: number;
  className?: string;
}

export const CatchingAnimation: React.FC<CatchingAnimationProps> = ({
  isPlaying,
  onAnimationEnd,
  width = 70,
  height = 80,
  className
}) => {
  const frameWidth = 542;
  const frameHeight = 616;
  const totalFrames = 4;
  const frameDuration = 80; 

  return (
    <SpriteAnimator
      spriteSheet="/CatchingFramesTransparent.png"
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
