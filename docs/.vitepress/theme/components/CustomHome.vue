<script setup lang="ts">
import { ref, computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

const activeFilter = ref('ALL')

const categories = [
  { id: 'ALL', name: 'ALL', icon: '🏠' },
  { id: 'PRODUCT', name: 'PRODUCT', icon: '📦' },
  { id: 'TECH', name: 'TECH', icon: '💻' },
  { id: 'OPERATION', name: 'OPERATION', icon: '📊' },
  { id: 'GROWTH', name: 'GROWTH', icon: '🌱' }
]

const articles = ref([
  {
    id: 1,
    title: '产品思维入门',
    excerpt: '产品思维是一种以用户为中心，通过发现问题、定义问题、解决问题来创造价值的思维方式...',
    category: 'PRODUCT',
    date: 'JAN 15, 2024',
    readTime: '3 MIN READ',
    link: '/product/product-thinking'
  },
  {
    id: 2,
    title: '技术栈选择指南',
    excerpt: '在选择技术栈时，需要考虑项目需求、团队能力、生态成熟度等因素...',
    category: 'TECH',
    date: 'JAN 20, 2024',
    readTime: '4 MIN READ',
    link: '/tech/tech-stack'
  },
  {
    id: 3,
    title: '如何高效学习',
    excerpt: '学习是一辈子的事情，掌握正确的学习方法可以事半功倍。费曼学习法、刻意练习...',
    category: 'GROWTH',
    date: 'FEB 15, 2024',
    readTime: '5 MIN READ',
    link: '/growth/efficient-learning'
  },
  {
    id: 4,
    title: '用户增长策略',
    excerpt: '增长是一个系统工程，需要数据驱动和持续优化。AARRR 模型：获取、激活、留存、变现、推荐...',
    category: 'OPERATION',
    date: 'FEB 01, 2024',
    readTime: '6 MIN READ',
    link: '/operation/growth-strategy'
  }
])

const filteredArticles = computed(() => {
  if (activeFilter.value === 'ALL') {
    return articles.value
  }
  return articles.value.filter(article => article.category === activeFilter.value)
})

function scrollToSearch() {
  const searchBox = document.querySelector('.DocSearch')
  if (searchBox) {
    (searchBox as HTMLElement).click()
  }
}
</script>

<template>
  <Layout>
    <template #home-hero-before>
      <div class="custom-home">
        <div class="home-header">
          <div class="header-left">
            <div class="filter-tabs">
              <button
                v-for="category in categories"
                :key="category.id"
                :class="['filter-tab', { active: activeFilter === category.id }]"
                @click="activeFilter = category.id"
              >
                <span class="tab-icon">{{ category.icon }}</span>
                {{ category.name }}
              </button>
            </div>
          </div>
          <div class="header-right">
            <div class="search-box" @click="scrollToSearch">
              <span class="search-icon">🔍</span>
              <span class="search-placeholder">SEARCH_LOGS...</span>
            </div>
          </div>
        </div>

        <div class="articles-grid">
          <article
            v-for="article in filteredArticles"
            :key="article.id"
            :class="['article-card', `category-${article.category.toLowerCase()}`]"
          >
            <a :href="article.link" class="card-link">
              <div class="card-header">
                <span :class="['category-tag', `tag-${article.category.toLowerCase()}`]">
                  <span class="tag-icon">🏷</span>
                  {{ article.category }}
                </span>
                <span class="article-date">{{ article.date }}</span>
              </div>
              
              <h2 class="article-title">{{ article.title }}</h2>
              
              <p class="article-excerpt">{{ article.excerpt }}</p>
              
              <div class="card-footer">
                <span class="read-time">
                  <span class="time-icon">🕐</span>
                  {{ article.readTime }}
                </span>
                <span class="arrow-icon">↗</span>
              </div>
            </a>
          </article>
        </div>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.custom-home {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  background: white;
  border: 2px solid #000;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 4px 4px 0 #000;
  text-transform: uppercase;
}

.filter-tab:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.filter-tab.active {
  background: #1e40af;
  border-color: #1e40af;
  box-shadow: 4px 4px 0 #1e3a5f;
  color: white;
}

.filter-tab.active:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #1e3a5f;
}

.tab-icon {
  font-size: 1rem;
}

.header-right {
  display: flex;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid #000;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 280px;
  box-shadow: 4px 4px 0 #000;
}

.search-box:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.search-icon {
  font-size: 1.2rem;
}

.search-placeholder {
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.article-card {
  position: relative;
  background: white;
  border: 2px solid #000;
  border-radius: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 8px 8px 0 #000;
}

.article-card::after {
  content: '';
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  border: 2px solid #000;
  z-index: -1;
}

.article-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 12px 12px 0 #1e40af;
  border-color: #1e40af;
}

.card-link {
  display: block;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tag-product {
  background: #f97316;
  color: white;
}

.tag-tech {
  background: #3b82f6;
  color: white;
}

.tag-operation {
  background: #f59e0b;
  color: #000;
}

.tag-growth {
  background: #8b5cf6;
  color: white;
}

.tag-icon {
  font-size: 0.9rem;
}

.article-date {
  font-size: 0.75rem;
  color: #666;
  letter-spacing: 1px;
}

.article-title {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 1rem 0;
  color: #000;
  text-transform: uppercase;
}

.article-excerpt {
  font-size: 1rem;
  line-height: 1.6;
  color: #666;
  margin: 0 0 1.5rem 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.read-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
  letter-spacing: 1px;
}

.time-icon {
  font-size: 1rem;
}

.arrow-icon {
  font-size: 1.5rem;
  transition: transform 0.2s ease;
}

.article-card:hover .arrow-icon {
  transform: translate(4px, -4px);
  color: #1e40af;
}

@media (max-width: 768px) {
  .custom-home {
    padding: 1rem;
  }

  .home-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
    min-width: auto;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
