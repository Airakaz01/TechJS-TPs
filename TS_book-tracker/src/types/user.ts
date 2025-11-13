import { Document } from 'mongoose'; 

// Interface pour décrire la structure d'un utilisateur, y compris les propriétés de Mongoose
export interface IUser extends Document {
    username: string;
    password: string;
    // Mongoose ajoute automatiquement des propriétés comme _id, createdAt, updatedAt
    // En étendant Document, ces propriétés sont incluses dans l'interface.
}
