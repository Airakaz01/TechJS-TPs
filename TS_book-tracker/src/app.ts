// --- 1. Importations des modules nécessaires ---
import express from 'express'; // Importe Express
import { Request, Response, NextFunction } from 'express'; // Importe les types Express pour plus de clarté
import mongoose from 'mongoose'; // Importe Mongoose
import session from 'express-session'; // Importe Express-Session
import passport from 'passport'; // Importe Passport
import path from 'path'; // Pour la gestion des chemins de fichiers
import { fileURLToPath } from 'url'; // Pour obtenir __dirname avec les modules ES


// src/app.ts (début du fichier, après les imports existants)

import { Strategy as LocalStrategy } from 'passport-local'; // Pour la stratégie d'authentification locale
import bcrypt from 'bcryptjs'; // Pour comparer les mots de passe hachés

// Importe notre modèle utilisateur que nous venons de créer
import User from './models/User.js';
import type { IUser } from './types/user.js'; // Importe l'interface IUser

// src/app.ts (début du fichier, après les imports existants)

// Importe les routeurs que nous venons de créer
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';

// ... le reste de votre code app.ts

// Les stratégies Passport, Bcrypt et le modèle User seront importés plus tard.

// --- 2. Configuration pour simuler __dirname avec les modules ES ---
// Dans les modules ES, __dirname n'est pas directement disponible. On le recrée.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 3. Initialisation de l'application Express et du port ---
const app = express();
const PORT = process.env.PORT || 3000; // Utilise le port 3000 par défaut ou celui défini par l'environnement

// --- 4. Configuration de la connexion à MongoDB ---
const mongoURI = 'mongodb://127.0.0.1:27017/book_tracker_ts'; // URL de votre base de données MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('Connecté à MongoDB')) // Message de succès
    .catch((err: Error) => console.error('Erreur de connexion à MongoDB :', err)); // Message d'erreur avec type

// --- 5. Middlewares pour parser les corps de requête ---
// Ces middlewares permettent à Express de lire les données envoyées dans le corps des requêtes POST.
app.use(express.urlencoded({ extended: false })); // Pour les données de formulaires HTML (application/x-www-form-urlencoded)
app.use(express.json()); // Pour les requêtes avec un corps JSON (application/json)

// --- 6. Configuration du moteur de template Pug ---
// Indique à Express d'utiliser Pug pour rendre les vues et où trouver les fichiers de vues.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views')); // Les fichiers Pug sont dans le dossier 'views' à la racine du projet

// --- 7. Configuration du middleware express-session ---
// Met en place la gestion des sessions pour conserver l'état de l'utilisateur entre les requêtes.
app.use(session({
    secret: 'votre_secret_tres_secure_ts_tracker', // Une chaîne secrète pour signer le cookie de session. CHANGEZ-LA !
    resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
    saveUninitialized: false, // Ne pas sauvegarder les sessions non initialisées (nouvelles sessions sans données)
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // Durée de vie du cookie de session (ici, 24 heures)
}));

// --- 8. Initialisation de Passport ---
// Passport est le middleware d'authentification. Il doit venir APRÈS express-session.
app.use(passport.initialize()); // Initialise Passport
app.use(passport.session()); // Permet à Passport de restaurer la session utilisateur à partir du cookie

// src/app.ts (suite, après app.use(passport.session());)

// --- 9. Configuration de la stratégie d'authentification locale de Passport ---
passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    // Le `usernameField: 'username'` indique à Passport que le champ 'username'
    // du formulaire est celui qui contient le nom d'utilisateur.

    try {
        // 1. Chercher l'utilisateur dans la base de données par son nom d'utilisateur
        // Le type `IUser` est utilisé ici pour typer le résultat de `findOne`
        const user = await User.findOne({ username: username }) as (IUser | null);

        // Si aucun utilisateur n'est trouvé
        if (!user) {
            return done(null, false, { message: 'Nom d\'utilisateur incorrect.' });
        }

        // 2. Si l'utilisateur est trouvé, comparer le mot de passe fourni avec le mot de passe haché stocké
        const isMatch = await bcrypt.compare(password, user.password);

        // Si les mots de passe correspondent
        if (isMatch) {
            // Authentification réussie, retourne l'utilisateur. Passport attachera cet utilisateur à `req.user`.
            return done(null, user);
        } else {
            return done(null, false, { message: 'Mot de passe incorrect.' }); // Mot de passe incorrect
        }
    } catch (err: any) { // Type 'any' pour l'erreur pour la flexibilité, ou un type plus spécifique si connu
        // Gérer les erreurs de la base de données ou d'autres erreurs inattendues
        return done(err);
    }
}));


// --- 10. Sérialisation de l'utilisateur (comment stocker l'utilisateur en session) ---
// Cette fonction est appelée après une authentification réussie.
// Elle détermine quelles données de l'utilisateur doivent être stockées dans la session (ici, juste l'ID).
passport.serializeUser((user: any, done) => { // 'any' est utilisé pour Passport car il peut gérer différents types d'objets utilisateur
    done(null, user.id); // Stocke uniquement l'ID de l'utilisateur dans la session
});


// --- 11. Désérialisation de l'utilisateur (comment récupérer l'utilisateur de la session) ---
// Cette fonction est appelée à chaque requête ultérieure pour récupérer l'objet utilisateur
// complet à partir de son ID stocké en session.
passport.deserializeUser(async (id: string, done) => { // 'id' est l'ID de l'utilisateur stocké en session
    try {
        // Le type `IUser` est utilisé ici pour typer le résultat de `findById`
        const user = await User.findById(id) as (IUser | null);
        done(null, user); // Attache l'objet utilisateur complet à `req.user`
    } catch (err: any) { // Type 'any' pour l'erreur
        done(err); // Gère les erreurs
    }
});

// ... le reste de votre code app.ts (sections 9. Fichiers statiques et 10. Démarrage du serveur Express)

// --- 9. Fichiers statiques (pour le futur Tailwind CSS) ---
// Nous allons utiliser ce dossier pour servir les fichiers CSS générés par Tailwind.
app.use(express.static(path.join(__dirname, '../public')));

// src/app.ts (suite, après la configuration de Passport et les fichiers statiques)

// --- 12. Utilisation des routeurs ---
app.use('/auth', authRoutes); // Les routes d'authentification seront accessibles via /auth/...
app.use('/books', bookRoutes); // Les routes de gestion des livres seront accessibles via /books/...

// --- 13. Route par défaut : Redirection vers la page de connexion ---
app.get('/', (req: Request, res: Response) => res.redirect('/auth/login'));


// --- 14. Démarrage du serveur Express ---
// ... (votre code existant pour app.listen)
// --- 10. Démarrage du serveur Express ---
app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
});

// NOTE : Les importations des modèles, la configuration de la stratégie Passport,
// et l'intégration des routeurs seront ajoutées dans les étapes suivantes.
// Pour l'instant, app.ts est prêt à démarrer un serveur de base.