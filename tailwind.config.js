// tailwind.config.js
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                'xs': '475px',
                // Breakpoints default Tailwind sudah include
            },
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                },
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
            },
            animation: {
                'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin': 'spin 1s linear infinite',
                'bounce': 'bounce 1s infinite',
            },
            backdropBlur: {
                xs: '2px',
                sm: '4px',
                DEFAULT: '8px',
                md: '12px',
                lg: '16px',
                xl: '24px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}