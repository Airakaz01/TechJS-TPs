import { Router } from 'express';                   // Importe Router d'Express
import { ensureAuthenticated } from '../config/auth.js'; // Importe notre middleware de protection

const router = Router(); // Crée un nouvel objet Router

// --- Tableau de livres local (simule une base de données temporaire) ---
let books = [
    { id: 1, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
    { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen' },
    { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee' }
];

// --- Route GET /books/ : Afficher tous les livres ---
// Cette route est protégée : seul un utilisateur authentifié peut y accéder.
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('books', {
        title: 'Nos Livres',       // Titre de la page
        books: books,             // Passe le tableau de livres à la vue
        user: req.user            // L'objet utilisateur authentifié est disponible via req.user (grâce à Passport)
    });
});

// --- Route GET /books/add : Afficher le formulaire d'ajout de livre ---
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_book', {
        title: 'Ajouter un Livre', // Titre de la page
        error: null               // Pas d'erreur lors du premier affichage du formulaire
    });
});

// --- Route POST /books/add : Traiter l'ajout d'un nouveau livre ---
router.post('/add', ensureAuthenticated, (req, res) => {
    const { title, author } = req.body; // Récupère le titre et l'auteur du formulaire

    // Validation simple
    if (!title || !author) {
        return res.render('add_book', {
            title: 'Ajouter un Livre',
            error: 'Veuillez remplir tous les champs.' // Message d'erreur si les champs sont vides
        });
    }

    // Génère un nouvel ID unique (le plus grand ID existant + 1)
    const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
    
    // Ajoute le nouveau livre au tableau
    books.push({ id: newId, title, author });

    // Redirige vers la liste des livres après l'ajout
    res.redirect('/books');
});

export default router; // Exporte le routeur pour qu'il puisse être utilisé dans app.js