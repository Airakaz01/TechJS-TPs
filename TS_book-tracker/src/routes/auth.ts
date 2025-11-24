import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import type { IUser } from '../types/user.js';

const router = Router();

router.get('/register', (req: Request, res: Response) => {
    res.render('register', { title: 'Inscription', errors: [], username: '', password: '', password2: '' });
});

router.post('/register', async (req: Request, res: Response) => {
    const { username, password, password2 } = req.body;
    let errors: { msg: string }[] = [];

    if (!username || !password || !password2) {
        errors.push({ msg: 'Veuillez remplir tous les champs.' });
    }
    if (password !== password2) {
        errors.push({ msg: 'Les mots de passe ne correspondent pas.' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    if (errors.length > 0) {
        return res.render('register', { errors, username, password, password2, title: 'Inscription' });
    }

    try {
        const userExists = await User.findOne({ username: username }) as (IUser | null);
        if (userExists) {
            errors.push({ msg: 'Ce nom d\'utilisateur est déjà enregistré.' });
            return res.render('register', { errors, username, password, password2, title: 'Inscription' });
        }

        const newUser = new User({ username, password });

        await newUser.save();

        res.redirect('/auth/login');

    } catch (err: any) {
        console.error('Erreur lors de l\'enregistrement:', err);
        if (err.code === 11000) {
            errors.push({ msg: 'Ce nom d\'utilisateur est déjà enregistré.' });
        } else {
            errors.push({ msg: 'Une erreur inattendue est survenue.' });
        }
        return res.render('register', { errors, username, password, password2, title: 'Inscription' });
    }
});

router.get('/login', (req: Request, res: Response) => {
    res.render('login', { title: 'Connexion' });
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', {
        successRedirect: '/books',
        failureRedirect: '/auth/login',
    })(req, res, next);
});

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
    req.logout((err: any) => {
        if (err) {
            console.error('Erreur lors de la déconnexion:', err);
            return next(err);
        }
        res.redirect('/auth/login');
    });
});

export default router;