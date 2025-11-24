export enum BookStatus {
    Read = "Read",
    ReRead = "Re-read",
    DNF = "DNF",
    CurrentlyReading = "Currently reading",
    ReturnedUnread = "Returned Unread",
    WantToRead = "Want to read"
}

export enum BookFormat {
    Print = "Print",
    PDF = "PDF",
    Ebook = "Ebook",
    AudioBook = "AudioBook"
}

export interface IBook {
    title: string;
    author: string;
    numberOfPages: number;
    status: BookStatus;
    price: number;
    numberOfPagesRead: number;
    format: BookFormat;
    suggestedBy?: string;
    finished: boolean;
}
