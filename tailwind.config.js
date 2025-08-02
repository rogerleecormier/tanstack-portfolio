/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: theme('spacing.4'),
              marginBottom: theme('spacing.4'),
            },
            'thead th': {
              borderBottom: `2px solid ${theme('colors.gray.300')}`,
              padding: theme('spacing.2'),
              textAlign: 'left',
              fontWeight: '600',
              backgroundColor: theme('colors.gray.50'),
            },
            'tbody td': {
              borderBottom: `1px solid ${theme('colors.gray.200')}`,
              padding: theme('spacing.2'),
            },
            'tbody tr:nth-child(even)': {
              backgroundColor: theme('colors.gray.50'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
