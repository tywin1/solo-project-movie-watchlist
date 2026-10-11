/* set the initial theme based on saved preference or system preference */

const saved = localStorage.getItem('theme');
const preferred = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
document.documentElement.dataset.theme = saved ?? preferred;