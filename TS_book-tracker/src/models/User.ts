import { Schema, model } from 'mongoose';
import type { IUser } from '../types/user.js'; // Assurez-vous que le chemin est correct
import bcrypt from 'bcryptjs'; // Importe bcryptjs pour le hachage des mots de passe

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Le nom d\'utilisateur est requis.'], // Message d'erreur personnalisé
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis.']
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// --- Logique de hachage du mot de passe : avant la sauvegarde ---
// Utilise un hook 'pre-save' de Mongoose pour hacher le mot de passe avant de le sauvegarder.
// Le mot de passe n'est haché que s'il est nouveau ou a été modifié.
UserSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) { // Vérifie si le mot de passe n'a pas été modifié
        return next(); // Si non modifié, passe à l'étape suivante
    }
    try {
        const salt = await bcrypt.genSalt(10); // Génère un "sel" (nombre aléatoire)
        this.password = await bcrypt.hash(this.password, salt); // Hache le mot de passe
        next(); // Passe à l'étape suivante (sauvegarde)
    } catch (error: any) {
        next(error); // Passe l'erreur à la fonction de gestion des erreurs de Mongoose
    }
});

// Exporte le modèle Mongoose 'User'
export default model<IUser>('User', UserSchema);