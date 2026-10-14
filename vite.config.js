import {defineConfig} from 'vite';

// base './' để chạy được dưới https://magicalumbrella.github.io/Game/
export default defineConfig({
  base: './',
  build: {target: 'es2020'},
});
