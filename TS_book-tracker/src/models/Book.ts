import { Schema, model, Document } from 'mongoose';
import { IBook, BookStatus, BookFormat } from '../types/book.js';

export interface IBookDocument extends IBook, Document {}

const BookSchema = new Schema<IBookDocument>({
    title: { type: String, required: true },
    author: { type: String, required: true },
    numberOfPages: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(BookStatus), default: BookStatus.WantToRead, required: true },
    price: { type: Number, required: true, min: 0 },
    numberOfPagesRead: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(this: IBookDocument, v: number) {
                return v <= this.numberOfPages;
            },
            message: 'Le nombre de pages lues ne peut pas être supérieur au nombre total de pages.'
        }
    },
    format: { type: String, enum: Object.values(BookFormat), required: true },
    suggestedBy: { type: String, required: false },
    finished: { type: Boolean, default: false, required: true },
}, {
    timestamps: true
});

BookSchema.pre<IBookDocument>('save', function(next) {
    if (this.numberOfPagesRead === this.numberOfPages) {
        this.finished = true;
    } else {
        this.finished = false;
    }
    next();
});

export default model<IBookDocument>('Book', BookSchema);