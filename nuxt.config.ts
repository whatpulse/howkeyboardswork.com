// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@nuxt/content", "@nuxtjs/tailwindcss"],

  nitro: {
    preset: "static",
  },

  app: {
    head: {
      title: "How Keyboards Work - An Interactive Guide",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "An interactive guide explaining how keyboards work, from key press to character on screen. Learn about switches, matrices, debouncing, scan codes, HID, and more.",
        },
        {
          property: "og:title",
          content: "How Keyboards Work - An Interactive Guide",
        },
        {
          property: "og:description",
          content:
            "An interactive guide explaining how keyboards work, from key press to character on screen.",
        },
        { property: "og:url", content: "https://howkeyboardswork.com" },
        {
          property: "og:image",
          content: "https://howkeyboardswork.com/og-image.jpg",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "How Keyboards Work - An Interactive Guide",
        },
        {
          name: "twitter:description",
          content:
            "An interactive guide explaining how keyboards work, from key press to character on screen.",
        },
        {
          name: "twitter:image",
          content: "https://howkeyboardswork.com/og-image.jpg",
        },
      ],
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
      script: [
        {
          defer: true,
          "data-domain": "howkeyboardswork.com",
          src: "http://stats.lostdomain.org/js/script.hash.outbound-links.js",
        },
      ],
    },
  },

  content: {
    highlight: {
      theme: "github-dark",
    },
  },

  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    configPath: "tailwind.config.ts",
  },
});
