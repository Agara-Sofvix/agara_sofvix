import mongoose, { Document, Schema } from 'mongoose';

export interface IPDFDocument extends Document {
    user: mongoose.Schema.Types.ObjectId;
    content: string;
    pdfUrl: string; // Could be a file path or S3 URL
}

const PDFDocumentSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    pdfUrl: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const PDFDocument = mongoose.model<IPDFDocument>('PDFDocument', PDFDocumentSchema);

export default PDFDocument;
