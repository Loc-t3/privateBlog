import { defineConfig } from 'vitepress'

export const NAV_CONFIG = [
  { text: '首页', link: '/', icon: '🏠' },
  { text: '产品', link: '/product/', icon: '📦', description: '产品思考与设计' },
  { text: '技术', link: '/tech/', icon: '💻', description: '技术探索与实践' },
  { text: '运营', link: '/operation/', icon: '📊', description: '运营策略与增长' },
  { text: '成长', link: '/growth/', icon: '🌱', description: '个人成长与反思' },
  { text: '关于我', link: '/about/', icon: '👤', description: '了解更多关于我' }
]

export const BLOG_CONFIG = {
  title: 'mounc的个人主页',
  description: '记录产品、技术、运营与成长',
  author: 'mounc',
  socialLinks: [
    { icon: 'github', link: 'https://github.com/mounc' }
  ]
}

export default defineConfig({
  title: BLOG_CONFIG.title,
  description: BLOG_CONFIG.description,
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  
  head: [
    ['meta', { name: 'author', content: BLOG_CONFIG.author }],
    ['meta', { name: 'keywords', content: 'mounc,博客,产品,技术,运营,成长' }],
    ['meta', { name: 'referrer', content: 'no-referrer' }]
  ],

  markdown: {
    image: {
      lazyLoading: true
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: BLOG_CONFIG.title,
    
    nav: NAV_CONFIG.map(item => ({
      text: item.text,
      link: item.link
    })),

    sidebar: {
      '/product/': [
        {
          text: '产品',
          items: []
        }
      ],
      '/tech/': [
        {
          text: '技术',
          items: []
        }
      ],
      '/operation/': [
        {
          text: '运营',
          items: []
        }
      ],
      '/growth/': [
        {
          text: '成长',
          items: []
        }
      ]
    },

    socialLinks: BLOG_CONFIG.socialLinks,

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © ${new Date().getFullYear()} mounc`
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3]
    }
  }
})
