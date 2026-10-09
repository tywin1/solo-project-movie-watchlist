import { getWatchlist, saveWatchlist } from './storage.js';
const main = document.querySelector('.main');
const apiKey = 'c0932682';
const movieId = new URLSearchParams(window.location.search).get('id');

function renderStatus(message) {
    main.innerHTML = `<div class="empty-state"><p class="empty-state__text">${message}</p></div>`;
}

function renderMovie(movie) {
        const isSaved = getWatchlist().some(saved => saved.imdbID === movie.imdbID);
        const poster = movie.Poster !== 'N/A' ? movie.Poster : './images/movie-icon.png';
        const rottenTomatoes = movie.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value;

        main.innerHTML = `
                <article class="movie-detail">
                    <img class="movie-detail__poster" src="${poster}" alt="${movie.Title}">
                    <div class="movie-detail__info">
                        <h2 class="movie-detail__title">${movie.Title} <span>(${movie.Year})</span></h2>
                        <p class="movie-detail__meta">${movie.Rated} · ${movie.Runtime} · ${movie.Genre}</p>
                        <p class="movie-detail__ratings">
                            <img class="movie-card__star" src="./images/star.png" alt="">
                            ${movie.imdbRating} (${movie.imdbVotes} votes)
                            ${rottenTomatoes ? ` · 🍅 ${rottenTomatoes}` : ''}
                        </p>
                        <button class="movie-card__watchlist" type="button" aria-pressed="${isSaved}">
                            <span class="movie-card__watchlist-icon">${isSaved ? '✓' : '+'}</span>
                            <span>${isSaved ? 'On Watchlist' : 'Watchlist'}</span>
                        </button>
                        <p class="movie-card__plot">${movie.Plot}</p>
                        <dl class="movie-detail__facts">
                            <dt>Director</dt><dd>${movie.Director}</dd>
                            <dt>Writers</dt><dd>${movie.Writer}</dd>
                            <dt>Cast</dt><dd>${movie.Actors}</dd>
                            <dt>Released</dt><dd>${movie.Released}</dd>
                            <dt>Language</dt><dd>${movie.Language}</dd>
                            <dt>Country</dt><dd>${movie.Country}</dd>
                            <dt>Awards</dt><dd>${movie.Awards}</dd>
                            <dt>Box office</dt><dd>${movie.BoxOffice ?? 'N/A'}</dd>
                        </dl>
                    </div>
                </article>
            `;
                main.querySelector('.movie-card__watchlist').addEventListener('click', () => toggleWatchlist(movie));
}

function toggleWatchlist(movie) {
    const watchlist = getWatchlist();
    const isSaved = watchlist.some(saved => saved.imdbID === movie.imdbID);
    const updated = isSaved
        ? watchlist.filter(saved => saved.imdbID !== movie.imdbID)
        : [...watchlist, movie];

    saveWatchlist(updated);
    renderMovie(movie);
}

async function loadMovie() {
    if (!movieId) {
        renderStatus('No movie selected.');
        return;
    }

    try {
        const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(movieId)}&plot=full`
        );
        const movie = await response.json();
        if (movie.Response === 'False') throw new Error(movie.Error);

        document.title = movie.Title;
        renderMovie(movie);
    } catch {
        renderStatus('Unable to load this movie.');
    }
}
loadMovie();


