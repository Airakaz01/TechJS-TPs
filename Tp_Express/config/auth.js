// Ce middleware vérifie si l'utilisateur est authentifié.
// Si oui, il passe la main au middleware ou à la route suivante (next()).
// Sinon, il redirige l'utilisateur vers la page de connexion.
export const ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) { // req.isAuthenticated() est fourni par Passport
        return next(); // L'utilisateur est authentifié, continue vers la prochaine fonction
    }
    // L'utilisateur n'est pas authentifié, le redirige vers la page de connexion
    res.redirect('/auth/login');
};