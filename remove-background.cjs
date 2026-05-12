const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function removeBackground() {
  try {
    const inputDir = './public/pitching-frames';
    const outputDir = './public/pitching-frames-transparent';
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Process each frame
    for (let i = 1; i <= 16; i++) {
      const filename = `pitching-frame-${String(i).padStart(2, '0')}.png`;
      const inputPath = `${inputDir}/${filename}`;
      const outputPath = `${outputDir}/${filename}`;
      
      // Load the original frame
      const image = await loadImage(inputPath);
      
      // Create canvas
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      
      // Draw the image
      ctx.drawImage(image, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Background color to remove (assuming white/light background)
      // You may need to adjust these values based on your actual background color
      const backgroundColor = { r: 255, g: 255, b: 255 };
      const tolerance = 30; // Color matching tolerance
      
      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Check if pixel matches background color within tolerance
        if (
          Math.abs(r - backgroundColor.r) <= tolerance &&
          Math.abs(g - backgroundColor.g) <= tolerance &&
          Math.abs(b - backgroundColor.b) <= tolerance
        ) {
          // Make pixel transparent
          data[i + 3] = 0; // Set alpha to 0
        }
      }
      
      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Save the transparent frame
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`Processed: ${filename}`);
    }
    
    console.log(`Successfully removed background from all frames. Output in ${outputDir}/`);
    
  } catch (error) {
    console.error('Error removing background:', error);
  }
}

removeBackground();
