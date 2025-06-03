import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'BeatUI',
  description: 'Modern TypeScript UI Component Library',
  base: '/',
  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Components', link: '/components/' },
      { text: 'GitHub', link: 'https://github.com/your-username/beatui' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Theming',
          items: [
            { text: 'Design Tokens', link: '/guide/design-tokens' },
            { text: 'CSS Architecture', link: '/guide/css-architecture' },
            { text: 'Customization', link: '/guide/customization' }
          ]
        }
      ],
      '/components/': [
        {
          text: 'Form Components',
          items: [
            { text: 'Button', link: '/components/button' },
            { text: 'Input', link: '/components/input' },
            { text: 'Checkbox', link: '/components/checkbox' }
          ]
        },
        {
          text: 'Layout Components',
          items: [
            { text: 'App Shell', link: '/components/app-shell' },
            { text: 'Overlay', link: '/components/overlay' }
          ]
        },
        {
          text: 'Data Components',
          items: [
            { text: 'Tag', link: '/components/tag' },
            { text: 'Tags Input', link: '/components/tags-input' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/beatui' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Franco Ponticelli'
    }
  },

  vite: {
    resolve: {
      alias: {
        'beatui': '../../packages/beatui/src'
      }
    }
  }
})
