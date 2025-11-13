// routes/auth.js

import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = Router();

// --- Route GET /auth/register : Afficher le formulaire d'inscription ---
router.get('/register', (req, res) => {
    // Passe un objet vide pour `errors`, `username`, `password`, `password2`
    // pour éviter des erreurs de 'undefined' lors du premier rendu.
    res.render('register', { title: 'Inscription', errors: [], username: '', password: '', password2: '' });
});

// --- Route POST /auth/register : Traiter l'inscription de l'utilisateur ---
router.post('/register', async (req, res) => {
    const { username, password, password2 } = req.body;
    let errors = []; // Tableau pour stocker les erreurs de validation

    // --- Validation des champs ---
    // Vérifie si tous les champs sont remplis
    if (!username || !password || !password2) {
        errors.push({ msg: 'Veuillez remplir tous les champs.' });
    }
    // Vérifie si les mots de passe correspondent
    if (password !== password2) {
        errors.push({ msg: 'Les mots de passe ne correspondent pas.' });
    }
    // Vérifie la longueur du mot de passe
    if (password.length < 6) {
        errors.push({ msg: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    // Si des erreurs existent, on réaffiche le formulaire avec les messages d'erreur et les données déjà entrées
    if (errors.length > 0) {
        return res.render('register', { errors, username, password, password2, title: 'Inscription' });
    }

    // --- Si aucune erreur de validation, procéder à l'enregistrement ---
    try {
        // 1. Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ username: username });
        if (userExists) {
            errors.push({ msg: 'Ce nom d\'utilisateur est déjà enregistré.' });
            return res.render('register', { errors, username, password, password2, title: 'Inscription' });
        }

        // 2. Créer une nouvelle instance d'utilisateur
        const newUser = new User({ username, password });

        // 3. Hacher le mot de passe
        const salt = await bcrypt.genSalt(10); // Génère un "sel" pour le hachage
        newUser.password = await bcrypt.hash(newUser.password, salt); // Hache le mot de passe

        // 4. Sauvegarder le nouvel utilisateur dans la base de données
        await newUser.save();

        // Rediriger vers la page de connexion après une inscription réussie
        res.redirect('/auth/login');

    } catch (err) {
        console.error(err);
        errors.push({ msg: 'Une erreur est survenue lors de l\'enregistrement.' });
        return res.render('register', { errors, username, password, password2, title: 'Inscription' });
    }
});

// --- Route GET /auth/login : Afficher le formulaire de connexion ---
router.get('/login', (req, res) => {
    // Pour l'instant, pas de messages d'erreur spécifiques à passer ici,
    // Passport gérera la redirection en cas d'échec.
    res.render('login', { title: 'Connexion' });
});

// --- Route POST /auth/login : Traiter la connexion de l'utilisateur ---
router.post('/login', (req, res, next) => {
    // Utilise le middleware d'authentification 'local' de Passport.
    // successRedirect : URL où rediriger en cas de succès.
    // failureRedirect : URL où rediriger en cas d'échec.
    passport.authenticate('local', {
        successRedirect: '/books',     // Redirection après connexion réussie (vers la page des livres)
        failureRedirect: '/auth/login', // Redirection après échec de connexion (vers le formulaire de connexion)
        // Vous pouvez ajouter `failureFlash: true` ici si vous utilisez `connect-flash`
        // pour afficher des messages d'erreur, mais nous l'avons omis pour une approche minimale.
    })(req, res, next); // Appel du middleware Passport
});

// --- Route GET /auth/logout : Déconnecter l'utilisateur ---
router.get('/logout', (req, res, next) => {
    // req.logout() est une méthode fournie par Passport pour mettre fin à la session de l'utilisateur.
    // Elle prend une fonction de rappel depuis Passport 0.6.0.
    req.logout((err) => {
        if (err) {
            // Gérer les erreurs potentielles lors de la déconnexion
            console.error('Erreur lors de la déconnexion:', err);
            return next(err);
        }
        // Rediriger l'utilisateur vers la page de connexion après la déconnexion
        res.redirect('/auth/login');
    });
});

export default router;