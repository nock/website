import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Nock",
  description: "HTTP server mocking and expectations library for Node.js",
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started', activeMatch: '^/(getting-started|guide)' },
      { text: 'API Reference', link: '/api/expectations', activeMatch: '^/api/' },
      { text: 'Troubleshooting', link: '/troubleshooting/common-issues', activeMatch: '^/troubleshooting/' },
      { text: 'Migrations', link: '/migrations/', activeMatch: '^/migrations/' },
      { text: 'npm', link: 'https://www.npmjs.com/package/nock' },
    ],

    search: { provider: 'local' },

    outline: [2, 3],

    sidebar: [
      {
        text: 'Getting Started',
        items: [{ text: 'Install and First Mock', link: '/getting-started' }],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Matching Requests', link: '/guide/request-matching' },
          { text: 'Replies and Headers', link: '/guide/replies-and-headers' },
          { text: 'Repeating and Optional Interceptors', link: '/guide/repeat-persist-optional' },
          { text: 'Filtering Requests', link: '/guide/filtering' },
          { text: 'TypeScript', link: '/guide/typescript' },
          { text: 'Passthrough Requests', link: '/guide/passthrough' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Expectations', link: '/api/expectations' },
          { text: 'Lifecycle and Network Controls', link: '/api/lifecycle-and-network' },
          { text: 'Scope Options', link: '/api/scope-options' },
          { text: 'Recorder', link: '/api/recorder' },
          { text: 'Definitions and Fixtures', link: '/api/definitions' },
          { text: 'Events', link: '/api/events' },
          { text: 'Nock Back', link: '/api/nock-back' },
        ],
      },
      {
        text: 'Troubleshooting',
        items: [
          { text: 'Common Issues', link: '/troubleshooting/common-issues' },
          { text: 'Debugging', link: '/troubleshooting/debugging' },
        ],
      },
      {
        text: 'Upgrading',
        collapsed: true,
        items: [
          { text: 'Migrations', link: '/migrations/' },
          { text: '14.x → 15.x', link: '/migrations/14-to-15' },
          { text: '13.x → 14.x', link: '/migrations/13-to-14' },
        ],
      },
      {
        text: 'Community',
        collapsed: true,
        items: [
          { text: 'Community', link: '/community/' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nock/nock' },
    ],
  },
})
