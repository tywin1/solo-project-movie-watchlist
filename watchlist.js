import { getWatchlist, saveWatchlist } from './storage.js';
import { el, createMovieCard } from './layout.js'

const main = document.querySelector('.main');

function renderWatchlist() {
    const movies = getWatchlist();

    if (movies.length === 0) {
        main.replaceChildren(
            el('div', { className: 'empty-state' }, [
                el('p', { className: 'empty-state__text', text: 'Your watchlist is currently empty.' }),
                el('a', { href: './index.html', text: "Let's add some movies!" }),
            ])
        );
        return;
    }

    main.replaceChildren(...movies.flatMap(movie => [
        createMovieCard(movie, true),
        el('hr', { className: 'movie-card__divider' }),
    ]));
}

main.addEventListener('click', event => {
    const button = event.target.closest('.movie-card__watchlist');
    if (!button?.dataset.movieId) return;
    
    saveWatchlist(getWatchList().filter(movie => movie.imdbID !== button.dataset.movieId));
    renderWatchlist();
});

renderWatchlist();