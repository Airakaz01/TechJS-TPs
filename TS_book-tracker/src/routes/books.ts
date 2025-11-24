import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../middlewares/auth.js';
import Book from '../models/Book.js';
import { IBook, BookFormat, BookStatus } from '../types/book.js';
import type { IBookDocument } from '../models/Book.js';

const router = Router();

router.get('/', ensureAuthenticated, async (req: Request, res: Response) => {
    try {
        const books: IBookDocument[] = await Book.find({});

        const booksWithStats = books.map(book => {
            const percentage = book.numberOfPages > 0
                ? Math.min(Math.round((book.numberOfPagesRead / book.numberOfPages) * 100), 100)
                : 0;
            return {
                ...book.toObject(),
                percentageRead: percentage
            };
        });

        const totalBooksRead = books.filter(book => book.status === BookStatus.Read || book.status === BookStatus.ReRead).length;
        const totalPagesRead = books.reduce((sum, book) => sum + book.numberOfPagesRead, 0);
        const totalNumberOfBooks = books.length;
        const totalPagesInCollection = books.reduce((sum, book) => sum + book.numberOfPages, 0);

        res.render('books', {
            title: 'Mes Livres',
            books: booksWithStats,
            user: req.user,
            BookStatus,
            BookFormat,
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

router.get('/add', ensureAuthenticated, (req: Request, res: Response) => {
    res.render('add_book', {
        title: 'Ajouter un Livre',
        error: null,
        BookStatus,
        BookFormat
    });
});

router.post('/add', ensureAuthenticated, async (req: Request, res: Response) => {
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
            errors,
            book: { title, author, numberOfPages, status, price, numberOfPagesRead, format, suggestedBy },
            BookStatus, BookFormat
        });
    }

    try {
        const newBook: IBookDocument = new Book({
            title,
            author,
            numberOfPages,
            status,
            price,
            numberOfPagesRead,
            format,
            suggestedBy: suggestedBy || undefined,
        });

        await newBook.save();
        res.redirect('/books');

    } catch (err: any) {
        console.error('Erreur lors de l\'ajout du livre :', err);
        let errorMsg = 'Une erreur est survenue lors de l\'ajout du livre.';
        if (err.name === 'ValidationError') {
            errorMsg = err.message;
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