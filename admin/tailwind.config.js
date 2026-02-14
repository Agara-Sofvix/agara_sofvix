/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "var(--primary-color, #135bec)",
                "accent-red": "var(--primary-color, #e63946)",
                "accent-orange": "#f4a261",
                "background-light": "#f6f6f8",
                "background-dark": "#0b0e14",
                "card-dark": "#161b26",
            },
            fontFamily: {
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
