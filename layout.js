const footerContainer = document.querySelector('.footer-content');

const footerMarkup = `
    <p class="footer-text">Built with vague understanding by
    <a href="https://github.com/tywin1"  rel="noreferrer" target="_blank">Ramon E</a>
    </p>
`;

footerContainer.innerHTML = footerMarkup;

/* Theme toggle button appended to footer */

const themeToggle = document.createElement('button'); // Create the theme toggle button
themeToggle.type = 'button'; // Set the button type to 'button'
themeToggle.className = 'theme-toggle'; // Set the button class to 'theme-toggle'

function syncToggleLabel () {
    const isLight = document.documentElement.dataset.theme === 'light'; // Check if the current theme is light
    themeToggle.textContent = isLight ? 'Dark mode' : 'Light mode'; // Update the button label based on the current theme
}

themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; // Determine the next theme
    document.documentElement.dataset.theme = next; // Apply the next theme to the document
    localStorage.setItem('theme', next); // Save the next theme to local storage
    syncToggleLabel(); // Update the toggle button label
});

syncToggleLabel(); // Initialize the toggle button label based on the current theme
footerContainer.append(themeToggle); // Append the theme toggle button to the footer

/* element renderer to avoid innerHTML use */
export function el(tag, { className, text, ...attrs } = {}, children = []) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    node.append(...children);
    return node;
}

export function createMovieCard(movie, isSaved) {
    const poster = movie.Poster !== 'N/A' ? movie.Poster : './images/movie-icon.png';
    const href = `./movie.html?id=${encodeURIComponent(movie.imdbID)}`;
 
    return el('div', { className: 'movie-card' }, [
        el('a', { href }, [
            el('img', { className: 'movie-card__image', src: poster, alt: movie.Title }),
        ]),
               el('div', { className: 'movie-card__content' }, [
            el('div', { className: 'movie-card__header' }, [
                el('div', { className: 'movie-card__score' }, [
                    el('img', { className: 'movie-card__star', src: './images/star.png', alt: '' }),
                    el('p', { className: 'movie-card__rating', text: movie.imdbRating }),
                ]),
                el('h2', { className: 'movie-card__title' }, [
                    el('a', { href, text: movie.Title }),
                ]),
            ]),
            el('div', { className: 'movie-card__details' }, [
                el('p', { className: 'movie-card__runtime', text: movie.Runtime }),
                el('p', { className: 'movie-card__genre', text: movie.Genre }),
                el('button', {
                    className: 'movie-card__watchlist',
                    type: 'button',
                    'data-movie-id': movie.imdbID,
                    'aria-pressed': String(isSaved),
                }, [
                    el('span', { className: 'movie-card__watchlist-icon', text: isSaved ? '✓' : '+' }),
                    el('span', { text: isSaved ? 'On Watchlist' : 'Watchlist' }),
                ]),
            ]),
            el('p', { className: 'movie-card__plot', text: movie.Plot }),
        ]),
    ]);
}