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