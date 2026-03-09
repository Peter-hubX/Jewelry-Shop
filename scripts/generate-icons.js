import sharp from 'sharp';
import fs from 'fs';
import path from 'node:path';

const inputFile = path.join(__dirname, '../public/temp-icon.png');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
    try {
        console.log('Generating icons...');

        await sharp(inputFile)
            .resize(192, 192)
            .toFile(path.join(outputDir, 'icon-192.png'));

        console.log('Generated icon-192.png');

        await sharp(inputFile)
            .resize(512, 512)
            .toFile(path.join(outputDir, 'icon-512.png'));

        console.log('Generated icon-512.png');

        // Clean up temp file
        fs.unlinkSync(inputFile);
        console.log('Cleaned up temp file');

    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons();
