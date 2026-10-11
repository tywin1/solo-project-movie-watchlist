import { getWatchlist, saveWatchlist } from './storage.js';
import { el, createMovieCard } from './layout.js';
import { apiKey, apiUrl } from './config.js';

const elements = { // Cache DOM elements for later use
    main: document.querySelector('.main'),
    search: document.querySelector('.search'),
};

let currentMovies = []; // Store the currently displayed movies
let visibleCount = 4; // display count for a search result - limited to 4 with a "load more" button
const moviesPerLoad = 4; // as above

function renderStatusState(message, isError = false) { // Render a status message in the main content area
    elements.main.replaceChildren(
        el('div', { className: 'empty-state' }, [
            el('img', { className: 'empty-state__image', src: './images/movie-icon.png', alt: '' }),
            el('p', {
                className: `empty-state__text${isError ? ' empty-state__text--error' : ''}`,
                role: 'status',
                text: message,
            }),
        ])
    );
}
renderStatusState('Start exploring'); // Initial status message

elements.search.addEventListener('submit', handleSearchClick); // Handle search form submission
elements.main.addEventListener('click', handleWatchlistClick); // Handle watchlist button clicks

let searchController; // aborts the previous search when a new one starts

function handleSearchClick(event) {
    event.preventDefault();

    const query = elements.search.querySelector('input').value.trim();
    if (!query) {
        searchController?.abort();
        renderStatusState('Please enter a search query.', true);
        return;
    }

    searchController?.abort();
    searchController = new AbortController();
    const { signal } = searchController;

    const loadingTimer = setTimeout(() => renderStatusState('Finding movies...'), 300);

    fetch(`${apiUrl}?apikey=${apiKey}&type=movie&s=${encodeURIComponent(query)}`, { signal })
        .then(response => response.json())
        .then(data => {
            if (!data.Search) throw new Error(data.Error);
            return Promise.all(
                data.Search.filter(m => m.Response !== false)
                .map(movie =>
                    fetch(`${apiUrl}?apikey=${apiKey}&i=${movie.imdbID}`, { signal })
                        .then(response => response.json())
                )
            );
        })
        .then(movies => {
            currentMovies = movies;
            visibleCount = moviesPerLoad;
            renderMovies();
        })
        .catch(error => {
            if (error.name === 'AbortError') return; // superseded by a newer search
            renderStatusState('Unable to find what you\'re looking for. Please try another search.', true);
        })
        .finally(() => clearTimeout(loadingTimer));
}

function handleWatchlistClick(event) {
    if (event.target.closest('[data-action="load-more"]')) {
        visibleCount = Math.min(visibleCount + moviesPerLoad, currentMovies.length);
        renderMovies();
        return
    }
    const button = event.target.closest('.movie-card__watchlist'); // Find the closest watchlist button element to the clicked target
    if (!button) return;

    const movie = currentMovies.find(
        movie => movie.imdbID === button.dataset.movieId); // Find the movie object corresponding to the clicked button
    if(!movie) return; // If the movie is not found, exit the function

    const watchlist = getWatchlist(); // Retrieve the current watchlist from localStorage
    const isSaved = watchlist.some( // Check if the movie is already in the watchlist
        savedMovie => savedMovie.imdbID === movie.imdbID
    );

    const updatedWatchlist = isSaved // Create the updated watchlist based on whether the movie is already saved
        ? watchlist.filter(savedMovie => savedMovie.imdbID !== movie.imdbID) // Remove the movie from the watchlist if it is already saved
        : [...watchlist, movie]; // Add the movie to the watchlist if it is not already saved

    saveWatchlist(updatedWatchlist); // Save the updated watchlist to localStorage

    button.setAttribute('aria-pressed', String(!isSaved)); // Update the aria-pressed attribute to reflect the new state
    button.querySelector('.movie-card__watchlist-icon').textContent = isSaved ? '+' : '✓'; // Update the watchlist icon based on the new state
    button.querySelector('span:last-child').textContent = isSaved // Update the watchlist button text based on the new state
        ? 'Watchlist'
        : 'On Watchlist';
}

function renderMovies() { // Render function - the data from handleSearchClick is parsed in here and it renders 4 movies + load more button.  Load More will keep working until its at the end of the array.
    const savedIds = new Set(getWatchlist().map(movie => movie.imdbID));
    const nodes = currentMovies.slice(0, visibleCount).flatMap(movie => [
        createMovieCard(movie, savedIds.has(movie.imdbID)),
        el('hr', { className: 'movie-card__divider' }),
    ]);

    if (currentMovies.length > visibleCount) {
        nodes.push(el('button', {
            className: 'load-more',
            type: 'button',
            'data-action': 'load-more',
            text: 'Load More',
        }));
    }

    elements.main.replaceChildren(...nodes);
}
