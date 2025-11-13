import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../middlewares/auth.js'; // Notre middleware de protection
import Book from '../models/Book.js'; // Notre modèle Mongoose Book
import { IBook, BookFormat, BookStatus } from '../types/book.js'; // Interfaces et Enums pour les livres
import type { IBookDocument } from '../models/Book.js'; // Document Mongoose pour Book

const router = Router();

// --- Route GET /books/ : Afficher tous les livres ---
// Cette route est protégée : seul un utilisateur authentifié peut y accéder.
router.get('/', ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        // Récupère tous les livres de la base de données
        const books: IBookDocument[] = await Book.find({});

        // Calcule le pourcentage de lecture pour chaque livre et d'autres stats
        const booksWithStats = books.map(book => {
            const percentage = book.numberOfPages > 0
                ? Math.min(Math.round((book.numberOfPagesRead / book.numberOfPages) * 100), 100)
                : 0; // Gère le cas où numberOfPages est 0 pour éviter la division par zéro
            return {
                ...book.toObject(), // Convertit le document Mongoose en objet JavaScript pour l'édition
                percentageRead: percentage
            };
        });

        // Calcul des totaux globaux (pour la section globale demandée dans le TP)
        const totalBooksRead = books.filter(book => book.status === BookStatus.Read || book.status === BookStatus.ReRead).length;
        const totalPagesRead = books.reduce((sum, book) => sum + book.numberOfPagesRead, 0);
        const totalNumberOfBooks = books.length;
        const totalPagesInCollection = books.reduce((sum, book) => sum + book.numberOfPages, 0);


        res.render('books', {
            title: 'Mes Livres',       // Titre de la page
            books: booksWithStats,    // Passe les livres avec les stats à la vue
            user: req.user,           // L'objet utilisateur authentifié (du type IUser grâce à Passport)
            BookStatus,                // Passe les Enums à la vue pour affichage
            BookFormat,                // Passe les Enums à la vue pour affichage
            // Statistiques globales
            totalBooksRead,
            totalPagesRead,
            totalNumberOfBooks,
            totalPagesInCollection
        });
    } catch (err: any) {
        console.error('Erreur lors de la récupération des livres :', err);
        res.render('books', {
            title: 'Mes Livres',
            books: [],
            user: req.user,
            error: 'Impossible de charger les livres.',
            BookStatus, BookFormat,
            totalBooksRead: 0, totalPagesRead: 0, totalNumberOfBooks: 0, totalPagesInCollection: 0
        });
    }
});

// --- Route GET /books/add : Afficher le formulaire d'ajout de livre ---
router.get('/add', ensureAuthenticated, (req: Request, res: Response) => {
    res.render('add_book', {
        title: 'Ajouter un Livre', // Titre de la page
        error: null,             // Pas d'erreur lors du premier affichage du formulaire
        BookStatus,              // Passe les Enums à la vue pour les options de formulaire
        BookFormat               // Passe les Enums à la vue pour les options de formulaire
    });
});

// --- Route POST /books/add : Traiter l'ajout d'un nouveau livre ---
router.post('/add', ensureAuthenticated, async (req: Request, res: Response) => {
    // Déstructure les données du corps de la requête, et convertit les nombres
    const {
        title,
        author,
        numberOfPages: numberOfPagesStr,
        status,
        price: priceStr,
        numberOfPagesRead: numberOfPagesReadStr,
        format,
        suggestedBy
    } = req.body;

    const numberOfPages = parseInt(numberOfPagesStr);
    const price = parseFloat(priceStr);
    const numberOfPagesRead = parseInt(numberOfPagesReadStr);

    let errors: { msg: string }[] = [];

    // Validation simple des champs (peut être étendue avec des librairies de validation comme express-validator)
    if (!title || !author || isNaN(numberOfPages) || isNaN(price) || isNaN(numberOfPagesRead) || !status || !format) {
        errors.push({ msg: 'Veuillez remplir tous les champs obligatoires avec des valeurs valides.' });
    }
    if (numberOfPages <= 0) {
        errors.push({ msg: 'Le nombre total de pages doit être supérieur à zéro.' });
    }
    if (numberOfPagesRead < 0 || numberOfPagesRead > numberOfPages) {
        errors.push({ msg: 'Le nombre de pages lues doit être valide et inférieur ou égal au total.' });
    }
    if (price < 0) {
        errors.push({ msg: 'Le prix ne peut pas être négatif.' });
    }
    if (!Object.values(BookStatus).includes(status)) {
        errors.push({ msg: 'Statut de livre invalide.' });
    }
    if (!Object.values(BookFormat).includes(format)) {
        errors.push({ msg: 'Format de livre invalide.' });
    }


    if (errors.length > 0) {
        return res.render('add_book', {
            title: 'Ajouter un Livre',
            errors, // Passe les erreurs à la vue
            // Repasse les valeurs saisies pour éviter de les retaper
            book: { title, author, numberOfPages, status, price, numberOfPagesRead, format, suggestedBy },
            BookStatus, BookFormat
        });
    }

    try {
        // Créer une nouvelle instance de livre
        const newBook: IBookDocument = new Book({
            title,
            author,
            numberOfPages,
            status,
            price,
            numberOfPagesRead,
            format,
            suggestedBy: suggestedBy || undefined, // S'assure que c'est undefined si vide
            // 'finished' sera automatiquement calculé par le hook 'pre-save'
        });

        await newBook.save(); // Sauvegarde le livre dans la base de données
        res.redirect('/books'); // Redirige vers la liste des livres

    } catch (err: any) {
        console.error('Erreur lors de l\'ajout du livre :', err);
        // Gérer les erreurs de sauvegarde Mongoose ou de validation du schéma
        let errorMsg = 'Une erreur est survenue lors de l\'ajout du livre.';
        if (err.name === 'ValidationError') {
            errorMsg = err.message; // Affiche le message de validation Mongoose
        }
        res.render('add_book', {
            title: 'Ajouter un Livre',
            error: errorMsg,
            book: { title, author, numberOfPages, status, price, numberOfPagesRead, format, suggestedBy },
            BookStatus, BookFormat
        });
    }
});

export default router;