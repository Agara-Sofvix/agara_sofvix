
const path = require('path');
const fs = require('fs');

const resolvePublicPath = (targetSubPath) => {
    const root = process.cwd();
    // Use targetSubPath but also try removing 'public/' prefix if we are already in/near it
    const subWithoutPublic = targetSubPath.replace(/^public\//, '');

    const candidates = [
        path.join(root, targetSubPath),
        path.join(root, '..', targetSubPath), // If in src/
        path.join(root, subWithoutPublic),
        path.join(root, '..', 'public', subWithoutPublic),
        path.join(__dirname, '..', '..', targetSubPath),
        path.join(__dirname, '..', 'public', subWithoutPublic)
    ];

    console.log(`Resolving for: ${targetSubPath}`);
    for (const p of candidates) {
        const exists = fs.existsSync(p);
        console.log(`Candidate: ${p} - Exists: ${exists}`);
        if (exists) return p;
    }
    const fallbackPath = path.join(root, targetSubPath);
    console.log(`Fallback: ${fallbackPath}`);
    return fallbackPath;
};

console.log('--- TESTING AVATARS ---');
resolvePublicPath('public/avatars');

console.log('\n--- TESTING UPLOADS ---');
resolvePublicPath('public/uploads');

console.log('\n--- CURRENT DIRECTORY ---');
console.log(process.cwd());

const backendPublicPath = path.join(process.cwd(), 'public/avatars');
console.log(`\nManual check for backend/public/avatars: ${fs.existsSync(backendPublicPath)}`);
