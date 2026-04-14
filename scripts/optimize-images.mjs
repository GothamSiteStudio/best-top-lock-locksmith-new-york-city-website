import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const imagesDir = path.join(projectRoot, 'images');
const sourceDir = path.join(imagesDir, 'source');
const supportedExtensions = new Set(['.png', '.jpg', '.jpeg']);
const maxWidth = 800;

function formatBytes(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ['KB', 'MB', 'GB'];
    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

async function collectImageFiles(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await collectImageFiles(fullPath));
            continue;
        }

        if (supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
            files.push(fullPath);
        }
    }

    return files;
}

function getOutputPath(filePath) {
    const relativeSourcePath = path.relative(sourceDir, filePath);
    return path.join(imagesDir, relativeSourcePath);
}

function createBasePipeline(buffer, metadata) {
    const pipeline = sharp(buffer, { animated: false });

    if ((metadata.width ?? 0) > maxWidth) {
        return pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    return pipeline;
}

async function optimizeImage(filePath) {
    const originalBuffer = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const metadata = await sharp(originalBuffer).metadata();
    const optimizedPath = getOutputPath(filePath);
    const webpPath = optimizedPath.replace(/\.(png|jpe?g)$/i, '.webp');

    let optimizedBuffer;
    if (extension === '.png') {
        optimizedBuffer = await createBasePipeline(originalBuffer, metadata)
            .png({
                compressionLevel: 9,
                effort: 10,
                palette: true,
                quality: 90
            })
            .toBuffer();
    } else {
        optimizedBuffer = await createBasePipeline(originalBuffer, metadata)
            .jpeg({
                quality: 82,
                mozjpeg: true
            })
            .toBuffer();
    }

    const webpBuffer = await createBasePipeline(originalBuffer, metadata)
        .webp({
            quality: 82,
            effort: 6
        })
        .toBuffer();

    await fs.mkdir(path.dirname(optimizedPath), { recursive: true });
    await fs.writeFile(optimizedPath, optimizedBuffer);

    await fs.writeFile(webpPath, webpBuffer);

    return {
        file: path.relative(projectRoot, filePath),
        outputFile: path.relative(projectRoot, optimizedPath),
        originalSize: originalBuffer.length,
        optimizedSize: optimizedBuffer.length,
        webpFile: path.relative(projectRoot, webpPath),
        webpSize: webpBuffer.length,
        resized: (metadata.width ?? 0) > maxWidth,
        dimensions: `${metadata.width ?? '?'}x${metadata.height ?? '?'}`
    };
}

async function main() {
    const imageFiles = await collectImageFiles(sourceDir);

    if (imageFiles.length === 0) {
        console.log('No PNG or JPEG images found in images/source/.');
        return;
    }

    const results = [];

    for (const filePath of imageFiles) {
        results.push(await optimizeImage(filePath));
    }

    console.log('Image optimization report');
    console.log('=========================');

    for (const result of results) {
        const savings = result.originalSize - result.optimizedSize;
        console.log(`${result.file} -> ${result.outputFile} (${result.dimensions})`);
        console.log(`  Optimized original: ${formatBytes(result.originalSize)} -> ${formatBytes(result.optimizedSize)}${savings > 0 ? `, saved ${formatBytes(savings)}` : ', unchanged'}`);
        console.log(`  WebP copy: ${result.webpFile} (${formatBytes(result.webpSize)})`);
        console.log(`  Resized to max width ${maxWidth}: ${result.resized ? 'yes' : 'no'}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});