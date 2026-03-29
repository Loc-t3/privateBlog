import { createContentLoader } from 'vitepress'
import type { RawArticle, Article } from './types'
import featuredArticles from './featured.json'

declare const data: Article[]
export { data }

export default createContentLoader(['product/*.md', 'tech/*.md', 'growth/*.md', 'operation/*.md'], {
  transform(raw): Article[] {
    const articles = raw
      .filter(page => page.frontmatter.title && page.url !== '/product/' && page.url !== '/tech/' && page.url !== '/growth/' && page.url !== '/operation/')
      .map(page => {
        const url = page.url
        const featured = featuredArticles.find(f => f.link === url)
        const category = getCategoryFromUrl(url)
        
        return {
          title: page.frontmatter.title,
          date: page.frontmatter.date || '',
          tags: page.frontmatter.tags || [],
          excerpt: page.frontmatter.description || getExcerpt(page.excerpt),
          category,
          link: url,
          priority: featured?.priority || 0,
          featured: featured?.featured || false
        }
      })
    
    return articles.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return +new Date(b.date) - +new Date(a.date)
    })
  }
})

function getCategoryFromUrl(url: string): string {
  if (url.startsWith('/product')) return 'PRODUCT'
  if (url.startsWith('/tech')) return 'TECH'
  if (url.startsWith('/operation')) return 'OPERATION'
  if (url.startsWith('/growth')) return 'GROWTH'
  return 'ALL'
}

function getExcerpt(excerpt: string | undefined): string {
  if (!excerpt) return ''
  return excerpt.slice(0, 100) + (excerpt.length > 100 ? '...' : '')
}
