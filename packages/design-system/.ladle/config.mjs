/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'src/**/*.stories.{tsx,ts}',
  viteConfig: './vite.config.ts',
  defaultStory: 'badge--default', // Always start at Badge component
  addons: {
    theme: {
      enabled: true, // Enable theme toggle for dark mode
    },
  },
};
