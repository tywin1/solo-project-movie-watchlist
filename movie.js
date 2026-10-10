import { getWatchlist, saveWatchlist } from './storage.js';
import { el } from './layout.js';

const main = document.querySelector('.main');
const apiKey = 'c0932682';
const movieId = new URLSearchParams(window.location.search).get('id');

function renderStatus(message) {
    main.replaceChildren(
        el('div', { className: 'empty-state' }, [
            el('p', { className: 'empty-state__text', text: message })
        ])
    );
}

function renderMovie(movie) {
    const isSaved = getWatchlist().some(saved => saved.imdbID === movie.imdbID);
    const poster = movie.Poster !== 'N/A' ? movie.Poster : './images/movie-icon.png';
    const rottenTomatoes = movie.Ratings?.find(r => r.Source === 'Rotten Tomatoes')?.Value;

    const facts = [
        ['Director', movie.Director],
        ['Writers', movie.Writer],
        ['Cast', movie.Actors],
        ['Released', movie.Released],
        ['Language', movie.Language],
        ['Country', movie.Country],
        ['Awards', movie.Awards],
        ['Box office', movie.BoxOffice ?? 'N/A'],
    ].flatMap(([label, value]) => [
        el('dt', { text: label }),
        el('dd', { text: value }),
    ]);

    const watchlistButton = el('button', {
        className: 'movie-card__watchlist',
        type: 'button',
        'aria-pressed': String(isSaved),
    }, [
        el('span', { className: 'movie-card__watchlist-icon', text: isSaved ? '✓' : '+' }),
        el('span', { text: isSaved ? 'On Watchlist' : 'Watchlist' }),
    ]);
    watchlistButton.addEventListener('click', () => toggleWatchlist(movie));

    main.replaceChildren(
        el('article', { className: 'movie-detail' }, [
            el('img', { className: 'movie-detail__poster', src: poster, alt: movie.Title }),
            el('div', { className: 'movie-detail__info' }, [
                el('h2', { className: 'movie-detail__title', text: `${movie.Title} ` }, [
                    el('span', { text: `(${movie.Year})` }),
                ]),
                el('p', {
                    className: 'movie-detail__meta',
                    text: `${movie.Rated} · ${movie.Runtime} · ${movie.Genre}`,
                }),
                el('p', { className: 'movie-detail__ratings' }, [
                    el('img', { className: 'movie-card__star', src: './images/star.png', alt: '' }),
                    document.createTextNode(
                        ` ${movie.imdbRating} (${movie.imdbVotes} votes)` +
                        (rottenTomatoes ? ` · 🍅 ${rottenTomatoes}` : '')
                    ),
                ]),
                watchlistButton,
                el('p', { className: 'movie-card__plot', text: movie.Plot }),
                el('dl', { className: 'movie-detail__facts' }, facts),
            ]),
        ])
    );
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


