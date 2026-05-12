const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function createTransparentSpriteSheet() {
  try {
    const inputDir = './public/pitching-frames-transparent';
    const outputPath = './public/PitchingFramesTransparent.png';
    
    // Configuration
    const COLS = 4;
    const ROWS = 4;
    const TOTAL_FRAMES = 16;
    
    // Load first frame to get dimensions
    const firstFrame = await loadImage(`${inputDir}/pitching-frame-01.png`);
    const FRAME_WIDTH = firstFrame.width;
    const FRAME_HEIGHT = firstFrame.height;
    
    // Create sprite sheet canvas
    const spriteSheetWidth = FRAME_WIDTH * COLS;
    const spriteSheetHeight = FRAME_HEIGHT * ROWS;
    const canvas = createCanvas(spriteSheetWidth, spriteSheetHeight);
    const ctx = canvas.getContext('2d');
    
    // Arrange frames in 4x4 grid
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const filename = `pitching-frame-${String(i + 1).padStart(2, '0')}.png`;
      const frame = await loadImage(`${inputDir}/${filename}`);
      
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = col * FRAME_WIDTH;
      const y = row * FRAME_HEIGHT;
      
      ctx.drawImage(frame, x, y, FRAME_WIDTH, FRAME_HEIGHT);
      console.log(`Placed frame ${i + 1} at position (${x}, ${y})`);
    }
    
    // Save the sprite sheet
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Created transparent sprite sheet: ${outputPath}`);
    console.log(`Sprite sheet dimensions: ${spriteSheetWidth}x${spriteSheetHeight}`);
    console.log(`Frame dimensions: ${FRAME_WIDTH}x${FRAME_HEIGHT}`);
    
  } catch (error) {
    console.error('Error creating transparent sprite sheet:', error);
  }
}

createTransparentSpriteSheet();
