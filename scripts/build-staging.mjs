import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, '.staging');

const excludedEntries = new Set([
    '.git',
    '.staging',
    '.playwright-mcp',
    'node_modules'
]);

const textFilesToRewrite = new Set(['.html']);

function shouldExclude(sourcePath) {
    const relativePath = path.relative(projectRoot, sourcePath);

    if (!relativePath) {
        return false;
    }

    const topLevelEntry = relativePath.split(path.sep)[0];
    return excludedEntries.has(topLevelEntry);
}

async function collectFiles(dirPath, matcher) {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...await collectFiles(entryPath, matcher));
            continue;
        }

        if (matcher(entryPath)) {
            files.push(entryPath);
        }
    }

    return files;
}

function injectNoindex(html) {
    if (/<meta\s+name=["']robots["']/i.test(html)) {
        return html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex, nofollow">');
    }

    return html.replace(/<\/head>/i, '    <meta name="robots" content="noindex, nofollow">\n</head>');
}

function stripMatomo(html) {
    return html
        .replace(/<!--\s*Matomo\s*-->[\s\S]*?<!--\s*End Matomo Code\s*-->\s*/gi, '')
    .replace(/<script>\s*var _paq = window\._paq = window\._paq \|\| \[\];[\s\S]*?matomo\.alphalockandsafe\.com[\s\S]*?<\/script>\s*/gi, '')
        .replace(/<noscript>[\s\S]*?matomo\.alphalockandsafe\.com[\s\S]*?<\/noscript>\s*/gi, '');
}

function buildStagingSiteConfig() {
    return [
        'window.BESTLOCK_SITE_CONFIG = {',
        '    staging: {',
        '        enabled: true,',
        "        label: 'Staging Preview',",
        "        message: 'Testing only. Noindex is enabled and analytics are disabled in this build.'",
        '    },',
        '    tawk: {',
        '        enabled: false,',
        "        propertyId: '',",
        "        widgetId: ''",
        '    }',
        '};',
        ''
    ].join('\n');
}

async function main() {
    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });

    const rootEntries = await readdir(projectRoot, { withFileTypes: true });

    for (const entry of rootEntries) {
        const sourcePath = path.join(projectRoot, entry.name);
        const destinationPath = path.join(outputDir, entry.name);

        if (shouldExclude(sourcePath)) {
            continue;
        }

        await cp(sourcePath, destinationPath, {
            recursive: true,
            filter: (nestedSourcePath) => !shouldExclude(nestedSourcePath)
        });
    }

    await rm(path.join(outputDir, 'CNAME'), { force: true });

    const files = await collectFiles(outputDir, (filePath) => textFilesToRewrite.has(path.extname(filePath).toLowerCase()));

    for (const filePath of files) {
        const original = await readFile(filePath, 'utf8');
        const rewritten = injectNoindex(stripMatomo(original));
        await writeFile(filePath, rewritten, 'utf8');
    }

    await writeFile(path.join(outputDir, 'js', 'site-config.js'), buildStagingSiteConfig(), 'utf8');

    console.log('Staging build ready in .staging/');
    console.log('Robots meta set to noindex, analytics removed, and CNAME omitted for safe preview deployment.');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});