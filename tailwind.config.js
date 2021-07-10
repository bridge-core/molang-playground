// tailwind.config.js
module.exports = {
	mode: 'jit',
	purge: {
		enabled: process.env.NODE_ENV === 'production',
		content: ['./src/**/*.{vue,ts}'],
	},
	darkMode: 'class', // or 'media' or 'class'
	theme: {
		extend: {},
	},
	variants: {
		extend: {},
	},
	plugins: [],
}
