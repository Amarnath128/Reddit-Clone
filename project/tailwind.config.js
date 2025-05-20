/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        orangered: '#FF4500',
        periwinkle: '#9494FF',
        upvote: '#FF4500',
        downvote: '#9494FF',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '100%',
            a: {
              color: theme('colors.orangered'),
              '&:hover': {
                color: theme('colors.orange.600'),
              },
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            a: {
              color: theme('colors.orangered'),
              '&:hover': {
                color: theme('colors.orange.500'),
              },
            },
            h1: {
              color: theme('colors.gray.100'),
            },
            h2: {
              color: theme('colors.gray.100'),
            },
            h3: {
              color: theme('colors.gray.100'),
            },
            h4: {
              color: theme('colors.gray.100'),
            },
            strong: {
              color: theme('colors.gray.100'),
            },
            code: {
              color: theme('colors.gray.300'),
            },
            blockquote: {
              color: theme('colors.gray.400'),
            },
          },
        },
      }),
    },
  },
  plugins: [],
};