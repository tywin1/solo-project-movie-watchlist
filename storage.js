export function getWatchlist() {
    try {
        const movies = JSON.parse(localStorage.getItem('watchlist') || '[]');
        return Array.isArray(movies) ? movies : [];
    } catch {
        return [];
    }
}

export function saveWatchlist(movies) {
    localStorage.setItem('watchlist', JSON.stringify(movies));
}