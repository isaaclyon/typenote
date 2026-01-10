/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'src/**/*.stories.{tsx,ts}',
  viteConfig: './vite.config.ts',
  addons: {
    theme: {
      enabled: false, // Using Tailwind, not Ladle theming
    },
  },
};
