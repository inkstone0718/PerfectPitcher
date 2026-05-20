const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function processUmpire() {
  try {
    const inputFile = './umpireAnimation.png';
    const outputStrikePath = './public/UmpireStrikeTransparent.png';
    const outputBallPath = './public/UmpireBallTransparent.png';
    
    if (!fs.existsSync(inputFile)) {
      throw new Error(`File not found: ${inputFile}`);
    }

    const spriteSheet = await loadImage(inputFile);
    
    // Configuration
    const COLS = 4;
    const ROWS = 2;
    const FRAME_WIDTH = Math.floor(spriteSheet.width / COLS);
    const FRAME_HEIGHT = Math.floor(spriteSheet.height / ROWS);
    
    console.log(`Input dimensions: ${spriteSheet.width}x${spriteSheet.height}`);
    console.log(`Calculated frame dimensions: ${FRAME_WIDTH}x${FRAME_HEIGHT}`);

    const strikeCanvas = createCanvas(FRAME_WIDTH * COLS, FRAME_HEIGHT);
    const strikeCtx = strikeCanvas.getContext('2d');
    
    const ballCanvas = createCanvas(FRAME_WIDTH * COLS, FRAME_HEIGHT);
    const ballCtx = ballCanvas.getContext('2d');

    // Process each frame
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const sourceX = col * FRAME_WIDTH;
        const sourceY = row * FRAME_HEIGHT;
        const destX = col * FRAME_WIDTH;
        const destY = 0;
        
        const frameCanvas = createCanvas(FRAME_WIDTH, FRAME_HEIGHT);
        const frameCtx = frameCanvas.getContext('2d');
        
        // Mirror all frames EXCEPT row 1 frame 2 (row 0, col 1)
        if (!(row === 0 && col === 1)) {
          console.log(`Mirroring row ${row + 1}, frame ${col + 1}`);
          frameCtx.translate(FRAME_WIDTH, 0);
          frameCtx.scale(-1, 1);
          frameCtx.drawImage(
            spriteSheet,
            sourceX, sourceY, FRAME_WIDTH, FRAME_HEIGHT,
            0, 0, FRAME_WIDTH, FRAME_HEIGHT
          );
          frameCtx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          console.log(`Keeping original row ${row + 1}, frame ${col + 1}`);
          frameCtx.drawImage(
            spriteSheet,
            sourceX, sourceY, FRAME_WIDTH, FRAME_HEIGHT,
            0, 0, FRAME_WIDTH, FRAME_HEIGHT
          );
        }
        
        const imageData = frameCtx.getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        const data = imageData.data;
        
        if (row === 1 && col === 2) {
          // Add 2-pixel high black line at the bottom to seal the gap
          for (let x = 0; x < FRAME_WIDTH; x++) {
            for (let y = FRAME_HEIGHT - 2; y < FRAME_HEIGHT; y++) {
              const idx = (y * FRAME_WIDTH + x) * 4;
              data[idx] = 0;
              data[idx+1] = 0;
              data[idx+2] = 0;
              data[idx+3] = 255;
            }
          }
        }
        
        const samples = [];
        for (let x = 0; x < FRAME_WIDTH; x += Math.max(1, Math.floor(FRAME_WIDTH / 20))) {
          samples.push([x, 0]);
          if (!(row === 1 && col === 2)) {
            samples.push([x, FRAME_HEIGHT - 1]);
          }
        }
        for (let y = 0; y < FRAME_HEIGHT; y += Math.max(1, Math.floor(FRAME_HEIGHT / 20))) {
          samples.push([0, y]);
          samples.push([FRAME_WIDTH - 1, y]);
        }

        const bgColorsSet = new Set();
        const bgColors = [];
        
        samples.forEach(([sx, sy]) => {
          const idx = (sy * FRAME_WIDTH + sx) * 4;
          const colorKey = `${data[idx]},${data[idx+1]},${data[idx+2]}`;
          if (!bgColorsSet.has(colorKey)) {
            bgColorsSet.add(colorKey);
            bgColors.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
          }
        });

        const tolerance = 45; 
        function isBg(r, g, b) {
          return bgColors.some(bg => 
            Math.abs(r - bg.r) <= tolerance && 
            Math.abs(g - bg.g) <= tolerance && 
            Math.abs(b - bg.b) <= tolerance
          );
        }

        const visited = new Uint8Array(FRAME_WIDTH * FRAME_HEIGHT);
        const queue = [];

        samples.forEach(([x, y]) => {
          const idx = y * FRAME_WIDTH + x;
          if (!visited[idx]) {
            const pIdx = idx * 4;
            if (isBg(data[pIdx], data[pIdx+1], data[pIdx+2])) {
              queue.push([x, y]);
              visited[idx] = 1;
            }
          }
        });

        let head = 0;
        while(head < queue.length) {
          const [cx, cy] = queue[head++];
          
          const idx = (cy * FRAME_WIDTH + cx) * 4;
          data[idx + 3] = 0; 
          
          const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < FRAME_WIDTH && ny >= 0 && ny < FRAME_HEIGHT) {
              const nIdx = ny * FRAME_WIDTH + nx;
              if (!visited[nIdx]) {
                const npIdx = nIdx * 4;
                if (isBg(data[npIdx], data[npIdx+1], data[npIdx+2])) {
                  visited[nIdx] = 1;
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }
        
        frameCtx.putImageData(imageData, 0, 0);
        
        // Draw to respective canvas
        if (row === 0) {
          strikeCtx.drawImage(frameCanvas, destX, destY);
        } else {
          ballCtx.drawImage(frameCanvas, destX, destY);
        }
        console.log(`Processed row ${row + 1}, frame ${col + 1}`);
      }
    }
    
    fs.writeFileSync(outputStrikePath, strikeCanvas.toBuffer('image/png'));
    fs.writeFileSync(outputBallPath, ballCanvas.toBuffer('image/png'));
    console.log(`Success! Created ${outputStrikePath} and ${outputBallPath}`);
    
  } catch (error) {
    console.error('Error processing umpire:', error);
  }
}

processUmpire();
