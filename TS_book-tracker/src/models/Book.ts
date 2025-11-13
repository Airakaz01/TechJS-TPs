// src/models/Book.ts

import { Schema, model, Document } from 'mongoose';
import { IBook, BookStatus, BookFormat } from '../types/book.js'; // Assurez-vous que le chemin est correct

// Étend l'interface IBook avec les propriétés que Mongoose ajoute aux documents
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
        // Validation personnalisée pour s'assurer que numberOfPagesRead <= numberOfPages
        validate: {
            validator: function(this: IBookDocument, v: number) {
                return v <= this.numberOfPages;
            },
            message: 'Le nombre de pages lues ne peut pas être supérieur au nombre total de pages.'
        }
    },
    format: { type: String, enum: Object.values(BookFormat), required: true },
    suggestedBy: { type: String, required: false }, // Optionnel
    finished: { type: Boolean, default: false, required: true },
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// --- Logique pour 'finished' : Mettre à jour automatiquement avant la sauvegarde ---
BookSchema.pre<IBookDocument>('save', function(next) {
    // Si le nombre de pages lues est égal au nombre total de pages, marquer comme terminé
    if (this.numberOfPagesRead === this.numberOfPages) {
        this.finished = true;
    } else {
        this.finished = false; // Sinon, s'assurer que ce n'est pas terminé
    }
    next();
});

// Exporte le modèle Mongoose 'Book'
export default model<IBookDocument>('Book', BookSchema);