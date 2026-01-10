/** @type {import('@ladle/react').UserConfig} */
export default {
  stories: 'src/**/*.stories.tsx',
  defaultStory: 'ui--button--all-variants',
  viteConfig: undefined, // Uses your existing vite.config.ts
  appendToHead: `
    <style>
      body {
        padding: 1rem;
      }
    </style>
  `,
};
