// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; // Imported as 'tailwind'

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind() // Used as 'tailwind()' to match the import above
  ],
});