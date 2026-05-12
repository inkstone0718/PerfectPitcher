import React from 'react';
import { SpriteAnimator } from './SpriteAnimator';

interface PitchingAnimationProps {
  isPlaying: boolean;
  onAnimationEnd?: () => void;
  size?: number;
  className?: string;
}

export const PitchingAnimation: React.FC<PitchingAnimationProps> = ({
  isPlaying,
  onAnimationEnd,
  size = 80,
  className
}) => {
  // PitchingFrames.png is 2816x1536 with 16 frames arranged in a 4x4 grid
  // Each frame is 704x384 pixels (2816/4 = 704, 1536/4 = 384)
  const frameWidth = 704;
  const frameHeight = 384;
  const totalFrames = 16;
  const frameDuration = 50; // 50ms per frame = 20fps total animation duration = 800ms

  return (
    <SpriteAnimator
      spriteSheet="/PitchingFrames.png"
      frameWidth={frameWidth}
      frameHeight={frameHeight}
      totalFrames={totalFrames}
      frameDuration={frameDuration}
      isPlaying={isPlaying}
      onEnd={onAnimationEnd}
      className={className}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated'
      }}
    />
  );
};
