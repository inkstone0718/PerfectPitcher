const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function removeBackground() {
  try {
    const inputDir = './public/pitching-frames';
    const outputDir = './public/pitching-frames-transparent';
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (let i = 1; i <= 8; i++) {
      const filename = `pitching-frame-${String(i).padStart(2, '0')}.png`;
      const inputPath = `${inputDir}/${filename}`;
      const outputPath = `${outputDir}/${filename}`;
      
      const image = await loadImage(inputPath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      
      const samples = [];
      // Top and bottom edges
      for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 20))) {
        samples.push([x, 0]);
        samples.push([x, height - 1]);
      }
      // Left and right edges
      for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 20))) {
        samples.push([0, y]);
        samples.push([width - 1, y]);
      }

      const bgColorsSet = new Set();
      const bgColors = [];
      
      samples.forEach(([sx, sy]) => {
        const idx = (sy * width + sx) * 4;
        const colorKey = `${data[idx]},${data[idx+1]},${data[idx+2]}`;
        if (!bgColorsSet.has(colorKey)) {
          bgColorsSet.add(colorKey);
          bgColors.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
        }
      });

      const tolerance = 45; // Increased tolerance slightly

      function isBg(r, g, b) {
        // Character is likely not gray if background is gray squares
        // But let's check against our sampled bg colors
        return bgColors.some(bg => 
          Math.abs(r - bg.r) <= tolerance && 
          Math.abs(g - bg.g) <= tolerance && 
          Math.abs(b - bg.b) <= tolerance
        );
      }

      const visited = new Uint8Array(width * height);
      const queue = [];

      // Start flood fill from all sample points that match background
      samples.forEach(([x, y]) => {
        const idx = y * width + x;
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
        
        const idx = (cy * width + cx) * 4;
        data[idx + 3] = 0; 
        
        const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
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
      
      ctx.putImageData(imageData, 0, 0);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      console.log(`Processed: ${filename}`);
    }
    console.log(`Success! Background removed with multi-sample flood-fill.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

removeBackground();
