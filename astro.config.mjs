import { defineConfig } from 'astro/config';
export default defineConfig({output:'static',base:process.env.BASE_PATH || '/',site:process.env.SITE_URL || 'https://kaoyan-optics-garden.yemengsama.chatgpt.site',trailingSlash:'always'});
