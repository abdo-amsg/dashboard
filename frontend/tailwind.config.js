/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand-color)',
        'brand-light': 'var(--brand-color-light)',
        'brand-dark': 'var(--brand-color-dark)',
        'text-primary': 'var(--text-color)',
        'text-secondary': 'var(--text-color-light)',
        'background': 'var(--background-color)',
        'border': 'var(--border-color)',
        'hover': 'var(--hover-color)',
        'button': 'var(--button-color)',
        'button-light': 'var(--button-color-light)',
        'button-dark': 'var(--button-color-dark)',
        'button-text': 'var(--button-text-color)',
        'card-background': 'var(--card-background-color)',
        'card-border': 'var(--card-border-color)',
        'input-border': 'var(--input-border-color)',
        'input-background': 'var(--input-background-color)',
        'input-text': 'var(--input-text-color)',
        'link': 'var(--link-color)',
        'link-hover': 'var(--link-hover-color)',
        'profile-background': 'var(--profile-background)',
        'danger': 'var(--danger-color)',
        'danger-light': 'var(--danger-color-light)',
        'highlight': 'var(--highlight-background)',
      }
    },
  },
  plugins: [],
}

