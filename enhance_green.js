const Jimp = require('jimp');
const path = require('path');

const inputPath = "C:\\Users\\drish\\.gemini\\antigravity\\brain\\9a6b5998-de87-4d19-9383-99dc4e73ee50\\media__1777061968257.jpg";
const outputPath = path.resolve(__dirname, 'frontend/src/assets/images/after_fraud.jpg');

async function enhanceGreen() {
    try {
        const image = await Jimp.read(inputPath);
        
        // Slightly enhance the green channel for a more lush look
        // Iterating over each pixel to gracefully multiply green
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            // idx is the index of the R channel, idx + 1 is G, idx + 2 is B
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // To make it slightly greener, boost G and slightly dampen R to remove the red-damaged look further
            // But doing it moderately
            const newG = Math.min(255, Math.floor(g * 1.3)); 
            const newR = Math.floor(r * 0.9);
            
            this.bitmap.data[idx + 0] = newR;
            this.bitmap.data[idx + 1] = newG;
            // keep B as is
        });
        
        await image.writeAsync(outputPath);
        console.log("Successfully generated enhanced green image at", outputPath);
    } catch (e) {
        console.error("Error processing image:", e);
    }
}

enhanceGreen();
