import { Request, Response, NextFunction } from 'express';
import type { IUser } from '../types/user.js'; // Importe l'interface IUser pour les types personnalisés de req.user

// Étend l'interface User de Passport pour inclure les propriétés de IUser.
// Cela permet à TypeScript de savoir que `req.user` est de type `IUser`.
declare global {
    namespace Express {
        interface User extends IUser {} // Passport ajoute l'objet utilisateur authentifié à req.user
    }
}

// Ce middleware vérifie si l'utilisateur est authentifié.
// Si oui, il passe la main au middleware ou à la route suivante (next()).
// Sinon, il redirige l'utilisateur vers la page de connexion.
export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    // req.isAuthenticated() est une méthode ajoutée par Passport au Request object.
    if (req.isAuthenticated()) {
        return next(); // L'utilisateur est authentifié, continue vers la prochaine fonction
    }
    // L'utilisateur n'est pas authentifié, le redirige vers la page de connexion
    res.redirect('/auth/login');
};