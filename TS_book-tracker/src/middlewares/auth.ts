import { Request, Response, NextFunction } from 'express';
import type { IUser } from '../types/user.js';

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};