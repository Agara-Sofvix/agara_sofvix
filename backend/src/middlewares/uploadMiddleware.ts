import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Robust directory resolution
const resolveUploadPath = (subDir: string) => {
    const root = process.cwd();
    const candidates = [
        path.join(root, subDir),
        path.join(root, 'backend', subDir),
        path.join(__dirname, '..', subDir),
        path.join(__dirname, '..', '..', subDir)
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }

    // If starting from backend folder, the path is already correct as subDir
    if (root.endsWith('backend') && fs.existsSync(path.join(root, subDir.replace('public/', '')))) {
        return path.join(root, subDir.replace('public/', ''));
    }

    // Default: prefer creating in backend/public if possible
    const target = root.endsWith('backend') ? path.join(root, subDir.replace('public/', '')) : path.join(root, 'backend', subDir);
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    return target;
};

const baseUploadDir = resolveUploadPath('public/uploads');
const brandingDir = path.join(baseUploadDir, 'branding');
const profilesDir = path.join(baseUploadDir, 'profiles');

[brandingDir, profilesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage for branding
const brandingStorage = multer.diskStorage({
    destination: (req: any, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, brandingDir);
    },
    filename: (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const prefix = file.fieldname === 'favicon' ? 'favicon' : 'logo';
        const filename = `${prefix}-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// Configure storage for profiles
const profileStorage = multer.diskStorage({
    destination: (req: any, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, profilesDir);
    },
    filename: (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const ext = path.extname(file.originalname);
        const filename = `avatar-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PNG, JPG, JPEG, SVG, and WEBP are allowed.'));
    }
};

// Create multer instances
export const logoUpload = multer({
    storage: brandingStorage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    }
});

export const profileUpload = multer({
    storage: profileStorage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    }
});

export const faviconUpload = multer({
    storage: brandingStorage,
    fileFilter,
    limits: {
        fileSize: 1 * 1024 * 1024 // 1MB limit for favicons
    }
});

export default profileUpload;
