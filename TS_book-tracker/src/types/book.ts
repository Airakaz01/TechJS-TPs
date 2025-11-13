// types/book.ts

// Enum pour le statut de lecture d'un livre
export enum BookStatus {
    Read = "Read",
    ReRead = "Re-read",
    DNF = "DNF", // Did Not Finish
    CurrentlyReading = "Currently reading",
    ReturnedUnread = "Returned Unread",
    WantToRead = "Want to read"
}

// Enum pour le format d'un livre
export enum BookFormat {
    Print = "Print",
    PDF = "PDF",
    Ebook = "Ebook",
    AudioBook = "AudioBook"
}

// Interface pour décrire la structure d'un livre
export interface IBook {
    title: string;
    author: string;
    numberOfPages: number;
    status: BookStatus;         // Utilise notre enum BookStatus
    price: number;
    numberOfPagesRead: number;  // Doit être < numberOfPages
    format: BookFormat;         // Utilise notre enum BookFormat
    suggestedBy?: string;       // Optionnel
    finished: boolean;          // Calculé automatiquement
}
