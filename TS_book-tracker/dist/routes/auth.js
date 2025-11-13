import { Router } from 'express';
import passport from 'passport';
import User from '../models/User.js'; // Modèle utilisateur
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
    let errors = []; // Tableau typé pour stocker les erreurs de validation
    // --- Validation des champs ---
    if (!username || !password || !password2) {
        errors.push({ msg: 'Veuillez remplir tous les champs.' });
    }
    if (password !== password2) {
        errors.push({ msg: 'Les mots de passe ne correspondent pas.' });
    }
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
        // 2. Créer une nouvelle instance d'utilisateur. Le hachage sera fait par le hook 'pre-save' du modèle.
        const newUser = new User({ username, password });
        // 3. Sauvegarder le nouvel utilisateur dans la base de données
        await newUser.save();
        // Rediriger vers la page de connexion après une inscription réussie
        res.redirect('/auth/login');
    }
    catch (err) { // Typé 'any' pour l flexibilité, ou plus spécifique si vous gérez des erreurs Mongoose/validation
        console.error('Erreur lors de l\'enregistrement:', err);
        // Si c'est une erreur de validation Mongoose ou autre
        if (err.code === 11000) { // Erreur de duplicata MongoDB
            errors.push({ msg: 'Ce nom d\'utilisateur est déjà enregistré.' });
        }
        else {
            errors.push({ msg: 'Une erreur inattendue est survenue.' });
        }
        return res.render('register', { errors, username, password, password2, title: 'Inscription' });
    }
});
// --- Route GET /auth/login : Afficher le formulaire de connexion ---
router.get('/login', (req, res) => {
    res.render('login', { title: 'Connexion' });
});
// --- Route POST /auth/login : Traiter la connexion de l'utilisateur ---
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/books', // Redirection après connexion réussie
        failureRedirect: '/auth/login', // Redirection après échec de connexion
        // failureFlash: true // Pour les messages flash, si utilisé
    })(req, res, next); // Appel du middleware Passport
});
// --- Route GET /auth/logout : Déconnecter l'utilisateur ---
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion:', err);
            return next(err);
        }
        res.redirect('/auth/login');
    });
});
export default router;
//# sourceMappingURL=auth.js.map