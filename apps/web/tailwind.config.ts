import type { Config } from 'tailwindcss'
import { colors, borderRadius } from '../../packages/design-tokens'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        'primary-dark': colors.primaryDark,
        'primary-light': colors.primaryLight,
        secondary: colors.secondary,
        'bg-gray': colors.backgroundGray,
      },
      borderRadius: {
        'sm': `${borderRadius.sm}px`,
        'md': `${borderRadius.md}px`,
        'lg': `${borderRadius.lg}px`,
        'xl': `${borderRadius.xl}px`,
      },
    },
  },
  plugins: [],
}
export default config

