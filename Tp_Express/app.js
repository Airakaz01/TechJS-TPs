// --- 1. Importations des modules nécessaires ---
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
// La stratégie locale de Passport sera importée plus tard une fois le modèle utilisateur défini.
import path from 'path';
import { fileURLToPath } from 'url'; // Pour obtenir __dirname avec les modules ES


// app.js (début du fichier, juste après les autres imports)

import { Strategy as LocalStrategy } from 'passport-local'; // Pour la stratégie d'authentification locale (username/password)
import bcrypt from 'bcryptjs'; // Pour comparer les mots de passe hachés
import User from './models/User.js'; // Importe notre modèle utilisateur que nous venons de créer



// app.js (début du fichier)
// ... autres imports ...
import authRoutes from './routes/auth.js'; // Importe le routeur d'authentification
// ...

// app.js (début du fichier)
// ... autres imports ...
import bookRoutes from './routes/books.js'; // Importe le routeur des livres
// ...

// --- 2. Configuration pour simuler __dirname avec les modules ES ---
// Dans les modules ES, __dirname n'est pas directement disponible. On le recrée.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// --- 3. Initialisation de l'application Express et du port ---
const app = express();
const PORT = 3000;


// --- 4. Configuration de la connexion à MongoDB ---
const mongoURI = 'mongodb://127.0.0.1:27017/auth_app_db_minimal'; // URL de votre base de données MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('Connecté à MongoDB')) // Message de succès
    .catch(err => console.error('Erreur de connexion à MongoDB :', err)); // Message d'erreur


// --- 5. Middlewares pour parser les corps de requête ---
// Ces middlewares permettent à Express de lire les données envoyées dans le corps des requêtes POST.
app.use(express.urlencoded({ extended: false })); // Pour les données de formulaires HTML (application/x-www-form-urlencoded)
app.use(express.json()); // Pour les requêtes avec un corps JSON (application/json)


// --- 6. Configuration du moteur de template Pug ---
// Indique à Express d'utiliser Pug pour rendre les vues et où trouver les fichiers de vues.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Les fichiers Pug seront dans un dossier 'views' à la racine du projet


// --- 7. Configuration du middleware express-session ---
// Met en place la gestion des sessions pour conserver l'état de l'utilisateur entre les requêtes.
app.use(session({
    secret: 'Airakazzakariaelhouari@!r@k@z', // Une chaîne secrète pour signer le cookie de session. CHANGEZ-LA !
    resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
    saveUninitialized: false, // Ne pas sauvegarder les sessions non initialisées (nouvelles sessions sans données)
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // Durée de vie du cookie de session (ici, 24 heures)
}));


// --- 8. Initialisation de Passport ---
// Passport est le middleware d'authentification. Il doit venir APRÈS express-session.
app.use(passport.initialize()); // Initialise Passport
app.use(passport.session()); // Permet à Passport de restaurer la session utilisateur à partir du cookie





// app.js (suite, après app.use(passport.session());)

// --- 9. Configuration de la stratégie d'authentification locale de Passport ---
passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    // Le `usernameField: 'username'` indique à Passport que le champ 'username'
    // du formulaire est celui qui contient le nom d'utilisateur.

    try {
        // 1. Chercher l'utilisateur dans la base de données par son nom d'utilisateur
        const user = await User.findOne({ username: username });

        // Si aucun utilisateur n'est trouvé
        if (!user) {
            return done(null, false, { message: 'Nom d\'utilisateur incorrect.' });
        }

        // 2. Si l'utilisateur est trouvé, comparer le mot de passe fourni avec le mot de passe haché stocké
        const isMatch = await bcrypt.compare(password, user.password);

        // Si les mots de passe correspondent
        if (isMatch) {
            return done(null, user); // Authentification réussie, retourne l'utilisateur
        } else {
            return done(null, false, { message: 'Mot de passe incorrect.' }); // Mot de passe incorrect
        }
    } catch (err) {
        // Gérer les erreurs de la base de données
        return done(err);
    }
}));


// --- 10. Sérialisation de l'utilisateur (comment stocker l'utilisateur en session) ---
// Cette fonction est appelée après une authentification réussie.
// Elle détermine quelles données de l'utilisateur doivent être stockées dans la session (ici, juste l'ID).
passport.serializeUser((user, done) => {
    done(null, user.id); // Stocke uniquement l'ID de l'utilisateur dans la session
});


// --- 11. Désérialisation de l'utilisateur (comment récupérer l'utilisateur de la session) ---
// Cette fonction est appelée à chaque requête ultérieure pour récupérer l'objet utilisateur
// complet à partir de son ID stocké en session.
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Trouve l'utilisateur par son ID
        done(null, user); // Attache l'objet utilisateur complet à `req.user`
    } catch (err) {
        done(err); // Gère les erreurs
    }
});

// app.js (suite, après les configurations Passport)

// --- 12. Utilisation des routes d'authentification ---
app.use('/auth', authRoutes); // Toutes les routes définies dans authRoutes seront préfixées par '/auth'

// app.js (suite, après les routes d'authentification)

// --- 13. Utilisation des routes d'authentification et des livres ---
// app.use('/auth', authRoutes);
app.use('/books', bookRoutes); // Toutes les routes définies dans bookRoutes seront préfixées par '/books'

// --- 14. Route par défaut ---
// ... (votre code existant pour app.get('/', ...))

// --- 13. Route par défaut (redirige vers la page de connexion) ---
app.get('/', (req, res) => res.redirect('/auth/login'));


// --- 14. Démarrage du serveur Express ---
// ... (votre code existant pour app.listen)


// --- 9. Démarrage du serveur Express ---
app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
});