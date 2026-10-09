import { getWatchlist, saveWatchlist } from './storage.js';
const main = document.querySelector('.main');

function renderWatchlist() {
    const movies = getWatchlist();

    if (movies.length === 0) {
        main.innerHTML = `
            <div class="empty-state">
                <p class="empty-state__text">Your watchlist is currently empty.</p>
                <a href="./index.html">Let's add some movies!</a>
            </div>
        `;
        return;
    }
    main.innerHTML = movies.map(movie => {
        const poster = movie.Poster !== 'N/A' ? movie.Poster : './images/movie-icon.png';
        return `
        <div class="movie-card">
        <a href="./movie.html?id=${movie.imdbID}">
            <img class="movie-card__image" src="${poster}" alt="${movie.Title}">
        </a>
            <div class="movie-card__content">
                <div class="movie-card__header">
                    <div class="movie-card__score">
                        <img class="movie-card__star" src="./images/star.png" alt="Star Rating">
                        <p class="movie-card__rating">${movie.imdbRating}</p>
                    </div>
                    <h2 class="movie-card__title">
                    <a href="./movie.html?id=${movie.imdbID}">${movie.Title}</a>
                    </h2>
                </div>
                <div class="movie-card__details">
                    <p class="movie-card__runtime">${movie.Runtime}</p>
                    <p class="movie-card__genre">${movie.Genre}</p>
                    <button class="movie-card__watchlist" type="button" data-movie-id="${movie.imdbID}">
                        <span class="movie-card__watchlist-icon">-</span>
                        <span>Remove</span>
                    </button>
                </div>
                <p class="movie-card__plot">${movie.Plot}</p>
            </div>
        </div>
        <hr class="movie-card__divider movie-card__divider--watchlist">
    `}).join('');
}

main.addEventListener('click', event => {
    const button = event.target.closest('.movie-card__watchlist');
    if (!button?.dataset.movieId) return;

    const movies = getWatchlist().filter(
        movie => movie.imdbID !== button.dataset.movieId
    );

    saveWatchlist(movies);
    renderWatchlist();
});

renderWatchlist();