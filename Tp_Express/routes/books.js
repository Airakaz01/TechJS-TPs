import { Router } from 'express';
import { ensureAuthenticated } from '../config/auth.js';

const router = Router();

let books = [
    { id: 1, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
    { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen' },
    { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee' }
];

router.get('/', ensureAuthenticated, (req, res) => {
    res.render('books', {
        title: 'Nos Livres',
        books: books,
        user: req.user
    });
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_book', {
        title: 'Ajouter un Livre',
        error: null
    });
});

router.post('/add', ensureAuthenticated, (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.render('add_book', {
            title: 'Ajouter un Livre',
            error: 'Please fill in all fields.'
        });
    }

    const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
    
    books.push({ id: newId, title, author });

    res.redirect('/books');
});

export default router;