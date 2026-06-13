/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        type: {
          normal: '#9FA19F',
          fire: '#E62829',
          water: '#2980EF',
          electric: '#FAC000',
          grass: '#3FA129',
          ice: '#3DCEF3',
          fighting: '#FF8000',
          poison: '#9141CB',
          ground: '#915121',
          flying: '#81B9EF',
          psychic: '#EF4179',
          bug: '#91A119',
          rock: '#AFA981',
          ghost: '#704170',
          dragon: '#5060E1',
          dark: '#624D4E',
          steel: '#60A1B8',
          fairy: '#EF70EF',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
  safelist: [
    { pattern: /bg-type-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)/ },
    { pattern: /text-type-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)/ },
    { pattern: /border-type-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)/ },
    { pattern: /from-type-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)/ },
    { pattern: /to-type-(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)/ },
  ],
}
