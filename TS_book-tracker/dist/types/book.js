// types/book.ts
// Enum pour le statut de lecture d'un livre
export var BookStatus;
(function (BookStatus) {
    BookStatus["Read"] = "Read";
    BookStatus["ReRead"] = "Re-read";
    BookStatus["DNF"] = "DNF";
    BookStatus["CurrentlyReading"] = "Currently reading";
    BookStatus["ReturnedUnread"] = "Returned Unread";
    BookStatus["WantToRead"] = "Want to read";
})(BookStatus || (BookStatus = {}));
// Enum pour le format d'un livre
export var BookFormat;
(function (BookFormat) {
    BookFormat["Print"] = "Print";
    BookFormat["PDF"] = "PDF";
    BookFormat["Ebook"] = "Ebook";
    BookFormat["AudioBook"] = "AudioBook";
})(BookFormat || (BookFormat = {}));
//# sourceMappingURL=book.js.map