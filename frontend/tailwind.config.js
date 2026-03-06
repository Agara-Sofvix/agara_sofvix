/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./AdminApp.tsx",
        "./App.tsx",
    ],
    theme: {
        screens: {
            'xs': '300px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
            '3xl': '1920px',
            '4xl': '2560px',
            '5xl': '3840px',
        },
        extend: {
            colors: {
                "primary": "#135bec",
                "warm-bg": "#d7ae85",
                "header-brown": "#92450f",
                "cream-light": "#fffbeb",
                "background-light": "#f6f6f8",
                "background-dark": "#0a0c10",
                "key-bg": "#1e2430",
                "key-blue": "#0f2142",
                "key-green": "#0b2419",
                "accent-blue": "#60a5fa",
            },
            fontFamily: {
                "display": ["Mukta Malar", "Lexend", "sans-serif"],
                "tamil": ["Mukta Malar", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1.5rem",
                "3xl": "2rem",
                "full": "9999px"
            },
            maxWidth: {
                '8xl': '88rem',
                '9xl': '96rem',
                'screen-3xl': '1920px',
                'screen-4xl': '2560px',
            },
            animation: {
                'marquee': 'marquee 25s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
