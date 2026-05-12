const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function splitPitchingFrames() {
  try {
    // Load the sprite sheet
    const spriteSheet = await loadImage('./public/PitchingFrames.png');
    
    // Configuration
    const FRAME_WIDTH = 704;
    const FRAME_HEIGHT = 384;
    const COLS = 4;
    const ROWS = 4;
    const TOTAL_FRAMES = 16;
    
    // Create output directory
    const outputDir = './public/pitching-frames';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Extract each frame
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      
      const sourceX = col * FRAME_WIDTH;
      const sourceY = row * FRAME_HEIGHT;
      
      // Create canvas for this frame
      const canvas = createCanvas(FRAME_WIDTH, FRAME_HEIGHT);
      const ctx = canvas.getContext('2d');
      
      // Draw the frame
      ctx.drawImage(
        spriteSheet,
        sourceX, sourceY, FRAME_WIDTH, FRAME_HEIGHT,
        0, 0, FRAME_WIDTH, FRAME_HEIGHT
      );
      
      // Save the frame
      const buffer = canvas.toBuffer('image/png');
      const filename = `pitching-frame-${String(i + 1).padStart(2, '0')}.png`;
      fs.writeFileSync(`${outputDir}/${filename}`, buffer);
      
      console.log(`Created: ${filename}`);
    }
    
    console.log(`Successfully split ${TOTAL_FRAMES} frames to ${outputDir}/`);
    
  } catch (error) {
    console.error('Error splitting frames:', error);
  }
}

splitPitchingFrames();
