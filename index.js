import { getWatchlist, saveWatchlist } from './storage.js';

const elements = { // Cache DOM elements for later use
    main: document.querySelector('.main'),
    search: document.querySelector('.search'),
};

let currentMovies = []; // Store the currently displayed movies
let visibleCount = 4; // display count for a search result - limited to 4 with a "load more" button
const moviesPerLoad = 4; // as above

function renderStatusState(message, isError = false) { // Render a status message in the main content area
    elements.main.innerHTML = `
        <div class="empty-state">
            <img class="empty-state__image" src="./images/movie-icon.png" alt="Movie image">
        <p class="empty-state__text${isError ? ' empty-state__text--error' : ''}">${message}</p>
        </div>
    `;
}
renderStatusState('Start exploring'); // Initial status message

function renderMovies() { // Render function - the data from handleSearchClick is parsed in here and it renders 4 movies + load more button.  Load More will keep working until its at the end of the array.
    const savedIds = new Set(getWatchlist().map(movie => movie.imdbID));
    const cards = currentMovies
                .slice(0, visibleCount)
                .map(movie => {
                const isSaved = savedIds.has(movie.imdbID); // Check if the current movie is already in the watchlist
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
                            <button class="movie-card__watchlist"
                                type="button"
                                data-movie-id="${movie.imdbID}"
                                aria-pressed="${isSaved}">
                                <span class="movie-card__watchlist-icon">${isSaved ? '✓' : '+'}</span>
                                <span>${isSaved ? 'On Watchlist' : 'Watchlist'}</span>
                            </button>
                        </div>
                        <p class="movie-card__plot">${movie.Plot}</p>
                    </div>
                </div>
                <hr class="movie-card__divider" />
            `;
            })
            .join('');

        const loadMoreButton = currentMovies.length > visibleCount
        ? '<button class="load-more" type="button" data-action="load-more">Load More</button>'
        : '';
    elements.main.innerHTML = cards + loadMoreButton;
}

const apiKey = 'c0932682';

elements.search.addEventListener('submit', handleSearchClick); // Handle search form submission
elements.main.addEventListener('click', handleWatchlistClick); // Handle watchlist button clicks

function handleSearchClick(event) {
    event.preventDefault();

    const query = elements.search.querySelector('input').value.trim(); // Get the search query from the input field
    if (!query) {
        renderStatusState('Please enter a search query.', true); // Show error if search query is empty
        return;
    }

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
        if (!data.Search) { // Check if the search returned any results
            throw new Error(data.Error); // Throw an error if no results found
        }
        return Promise.all( // Fetch detailed information for each movie in the search results
            data.Search.map(movie =>
                fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
                    .then(response => response.json())
            )
        );
    })
        .then(movies => {  // Handle the detailed movie data and render the movie cards
            currentMovies = movies;
            visibleCount = moviesPerLoad;
            renderMovies()
        })
        .catch(error => {
            renderStatusState('Unable to find what you\'re looking for. Please try another search.', true);
    });
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