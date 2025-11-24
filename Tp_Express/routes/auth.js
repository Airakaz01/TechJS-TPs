import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = Router();

router.get('/register', (req, res) => {
    res.render('register', { title: 'Inscription', errors: [], username: '', password: '', password2: '' });
});

router.post('/register', async (req, res) => {
    const { username, password, password2 } = req.body;
    let errors = [];

    if (!username || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields.' });
    }
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match.' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters.' });
    }

    if (errors.length > 0) {
        return res.render('register', { errors, username, password, password2, title: 'Inscription' });
    }

    try {
        const userExists = await User.findOne({ username: username });
        if (userExists) {
            errors.push({ msg: 'Username is already registered.' });
            return res.render('register', { errors, username, password, password2, title: 'Inscription' });
        }

        const newUser = new User({ username, password });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);

        await newUser.save();

        res.redirect('/auth/login');

    } catch (err) {
        console.error(err);
        errors.push({ msg: 'An error occurred during registration.' });
        return res.render('register', { errors, username, password, password2, title: 'Inscription' });
    }
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Connexion' });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/books',
        failureRedirect: '/auth/login',
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return next(err);
        }
        res.redirect('/auth/login');
    });
});

export default router;