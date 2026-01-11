/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'src/**/*.stories.{tsx,ts}',
  viteConfig: './vite.config.ts',
  defaultStory: 'badge--default', // Always start at Badge component
  addons: {
    theme: {
      enabled: false, // Using Tailwind, not Ladle theming
    },
  },
};
