/** @type {import('tailwindcss').Config} */
export default { content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'], theme: { extend: { colors: { brand: { 50: '#eef5ff', 100: '#dbeafe', 500: '#4778ee', 600: '#3563dc', 700: '#2b4fb4' } }, boxShadow: { soft: '0 8px 30px rgba(24, 39, 75, 0.06)' } } }, plugins: [] }
