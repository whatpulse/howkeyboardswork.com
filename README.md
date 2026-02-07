# How Keyboards Work

An interactive single-page guide explaining how keyboards work, from key press to character on screen.

Built with Nuxt 3, TailwindCSS, and @nuxt/content.

## Project Structure

```
├── assets/css/          # Global styles
├── components/
│   ├── base/            # Reusable UI components
│   ├── content/         # Components for markdown
│   └── toys/            # Interactive demos
├── content/guide/       # Markdown content files
├── layouts/             # App layouts
├── pages/               # Route pages
├── public/              # Static assets
├── nuxt.config.ts       # Nuxt configuration
└── tailwind.config.ts   # Tailwind configuration
```

## Content

Guide sections are markdown files in `content/guide/` with frontmatter:

```yaml
---
title: Section Title
description: Brief description
order: 1
slug: section-slug
---
```

Sections are automatically sorted by `order` and rendered on the homepage.

## License

[MIT License](LICENSE.md)
