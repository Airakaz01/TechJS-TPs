// src/models/Book.ts
import { Schema, model } from 'mongoose';
import { BookStatus, BookFormat } from '../types/book.js'; // Assurez-vous que le chemin est correct
const BookSchema = new Schema({
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
            validator: function (v) {
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
BookSchema.pre('save', function (next) {
    // Si le nombre de pages lues est égal au nombre total de pages, marquer comme terminé
    if (this.numberOfPagesRead === this.numberOfPages) {
        this.finished = true;
    }
    else {
        this.finished = false; // Sinon, s'assurer que ce n'est pas terminé
    }
    next();
});
// Exporte le modèle Mongoose 'Book'
export default model('Book', BookSchema);
//# sourceMappingURL=Book.js.map