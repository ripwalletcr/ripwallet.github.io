// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://ripwallet.co",
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    "/eduardo/seguimiento": "https://calendar.app.google/32Nfq7x5kHiUY9b36",
    "/jostin/seguimiento": "https://calendar.app.google/3hMeGdzrvKz8mRqJ9",
    "/kevin/revision": "https://calendar.app.google/NRkiidr8ttPYG5eE8",
    "/links": "https://linktr.ee/ripwallet",
  },
});
