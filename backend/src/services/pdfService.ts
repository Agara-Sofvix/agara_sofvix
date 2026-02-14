import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePDFFromText = (text: string, outputPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

        // TODO: Load a Tamil font here for proper rendering
        // const fontPath = path.join(__dirname, '../../assets/fonts/Latha.ttf');
        // if (fs.existsSync(fontPath)) {
        //     doc.font(fontPath);
        // } else {
        //     console.warn('Tamil font not found, using default font. Tamil text may not render correctly.');
        // }

        // For now, using standard font which might not support Tamil characters correctly
        // without a proper font file.
        doc.fontSize(12).text(text, {
            align: 'left'
        });

        doc.end();

        stream.on('finish', () => {
            resolve();
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
};
