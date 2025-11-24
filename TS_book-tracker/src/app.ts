import express from 'express';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';

import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import type { IUser } from './types/user.js';

import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const mongoURI = 'mongodb://127.0.0.1:27017/book_tracker_ts';
mongoose.connect(mongoURI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch((err: Error) => console.error('Erreur de connexion à MongoDB :', err));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

app.use(session({
    secret: 'votre_secret_tres_secure_ts_tracker',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    try {
        const user = await User.findOne({ username: username }) as (IUser | null);

        if (!user) {
            return done(null, false, { message: 'Nom d\'utilisateur incorrect.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Mot de passe incorrect.' });
        }
    } catch (err: any) {
        return done(err);
    }
}));

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id) as (IUser | null);
        done(null, user);
    } catch (err: any) {
        done(err);
    }
});

app.use(express.static(path.join(__dirname, '../public')));

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);

app.get('/', (req: Request, res: Response) => res.redirect('/auth/login'));

app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
});