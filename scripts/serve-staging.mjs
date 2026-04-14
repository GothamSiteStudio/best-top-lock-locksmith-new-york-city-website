import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const stagingRoot = path.join(projectRoot, '.staging');
const port = Number.parseInt(process.env.PORT || '8081', 10);

const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
    '.xml': 'application/xml; charset=utf-8'
};

function getContentType(filePath) {
    return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function resolveRequestPath(urlPath) {
    const safePath = decodeURIComponent((urlPath || '/').split('?')[0]);
    const normalizedPath = path.normalize(safePath).replace(/^([.][./\\])+/, '');
    return path.join(stagingRoot, normalizedPath);
}

async function ensureFilePath(requestPath) {
    let resolvedPath = resolveRequestPath(requestPath);

    try {
        const fileStat = await stat(resolvedPath);
        if (fileStat.isDirectory()) {
            resolvedPath = path.join(resolvedPath, 'index.html');
        }
    } catch {
        if (!path.extname(resolvedPath)) {
            resolvedPath = path.join(resolvedPath, 'index.html');
        }
    }

    await access(resolvedPath);
    return resolvedPath;
}

await access(stagingRoot).catch(() => {
    console.error('No staging build found. Run "npm run build:staging" first.');
    process.exit(1);
});

const server = http.createServer(async (request, response) => {
    try {
        const filePath = await ensureFilePath(request.url || '/');
        response.writeHead(200, {
            'Content-Type': getContentType(filePath),
            'Cache-Control': 'no-store'
        });
        createReadStream(filePath).pipe(response);
    } catch {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
    }
});

server.listen(port, () => {
    console.log(`Staging preview running at http://127.0.0.1:${port}`);
    console.log('Press Ctrl+C to stop the server.');
});