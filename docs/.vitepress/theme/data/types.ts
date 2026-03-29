export interface Article {
  title: string
  date: string
  tags: string[]
  excerpt: string
  category: string
  link: string
  priority: number
  featured: boolean
}

export interface FeaturedArticle {
  link: string
  priority: number
  featured?: boolean
}

export interface RawArticle {
  url: string
  frontmatter: {
    title?: string
    date?: string
    tags?: string[]
    description?: string
  }
  excerpt?: string
}
